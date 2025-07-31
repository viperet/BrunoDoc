import Handlebars, { HelperOptions } from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BruFolder, BruFile, BruCollection } from '../types/index.js';
import { formatJson } from './json.js';

export interface TemplateData {
  collection: BruCollection;
  allRequests: ProcessedRequest[];
  stats: {
    totalRequests: number;
    totalFolders: number;
    httpMethods: string[];
  };
  generatedAt: string;
}

export interface ProcessedRequest extends BruFile {
  method?: string;
  url?: string;
  queryParams?: Record<string, any>;
  pathParams?: Record<string, any>;
  description?: string;
  auth?: {
    type: string;
    details?: string;
  };
  body?: string;
  scripts?: {
    preRequest?: string;
    postResponse?: string;
  };
}

export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  private registerHelpers(): void {
    // Helper to check if value exists and is not empty
    this.handlebars.registerHelper('exists', function(value: any) {
      return value != null && value !== '';
    });

    // Helper to format JSON
    this.handlebars.registerHelper('json', function(value: any) {
      return JSON.stringify(value, null, 2);
    });

    // Helper to get keys of an object
    this.handlebars.registerHelper('keys', function(obj: any) {
      return Object.keys(obj || {});
    });

    // Helper to lowercase
    this.handlebars.registerHelper('lowercase', function(str: string) {
      return (str || '').toLowerCase();
    });

    // Helper for conditional equality
    this.handlebars.registerHelper('eq', function(a: any, b: any, options: HelperOptions) {
      return a === b ? options.fn(this) : options.inverse(this);
    });

    // Helper for conditional not equality
    this.handlebars.registerHelper('ne', function(a: any, b: any) {
      return a !== b;
    });

    // Helper to convert string to kebab-case for anchors
    this.handlebars.registerHelper('kebabCase', function(str: string) {
      return (str || '')
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    });

    // Helper to format date
    this.handlebars.registerHelper('formatDate', function(dateStr: string) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    });

    // Helper to format URLs (example: https://api.sentinus.vision/testruns/:test_run_id/notify)
    this.handlebars.registerHelper('formatUrl', function(url: string, options: HelperOptions) {
      if (!url) return '';
      const parsedUrl = new URL(url);
      // Escape HTML entities in protocol, host, and pathname
      const escapeHtml = (str: string) =>
        str.replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

      const pathname = escapeHtml(parsedUrl.pathname).replace(/(:[^/]+)/g, '<span class="param">$1</span>');
      const html = `<span class="protocol">${escapeHtml(parsedUrl.protocol)}</span>//<span class="host">${escapeHtml(parsedUrl.host)}</span><span class="path">${pathname}</span>`;
      return new Handlebars.SafeString(html);
    });

    // Helper for math operations
    this.handlebars.registerHelper('subtract', function(a: number, b: number) {
      return a - b;
    });

    // Helper for unless with comparison
    this.handlebars.registerHelper('unlessEq', function(this: any, a: any, b: any, options: any) {
      if (a !== b) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Plural helper
    this.handlebars.registerHelper('pluralize', function(count: number, singular: string, plural?: string) {
      if (typeof plural !== 'string') {
        plural = singular + 's'; // Default pluralization
      }
      return count + ' ' + (count === 1 ? singular : plural);
    });
  }

  public loadTemplate(templatePath: string): HandlebarsTemplateDelegate {
    if (this.templateCache.has(templatePath)) {
      return this.templateCache.get(templatePath)!;
    }

    try {
      const templateContent = readFileSync(templatePath, 'utf-8');
      const compiled = this.handlebars.compile(templateContent);
      this.templateCache.set(templatePath, compiled);
      return compiled;
    } catch (error) {
      throw new Error(`Failed to load template ${templatePath}: ${error}`);
    }
  }

  public loadPartial(partialName: string, partialPath: string): void {
    try {
      const partialContent = readFileSync(partialPath, 'utf-8');
      this.handlebars.registerPartial(partialName, partialContent);
    } catch (error) {
      console.warn(`Failed to load partial ${partialName}: ${error}`);
    }
  }

  public processCollection(collection: BruCollection): TemplateData {
    const allRequests = this.extractAllRequestsFromCollection(collection);
    const stats = this.calculateStatsFromCollection(collection, allRequests);

    return {
      collection,
      allRequests,
      stats,
      generatedAt: new Date().toISOString()
    };
  }

  private extractAllRequestsFromCollection(collection: BruCollection): ProcessedRequest[] {
    const requests: ProcessedRequest[] = [];

    // Recursively process all folders in the collection
    for (const folder of collection.folders) {
      const folderRequests = this.extractAllRequests(folder);
      requests.push(...folderRequests);
    }

    // Sort by sequence number
    requests.sort((a, b) => a.meta.seq - b.meta.seq);

    return requests;
  }

  private extractAllRequests(folder: BruFolder): ProcessedRequest[] {
    const requests: ProcessedRequest[] = [];

    // Process files in current folder
    for (const file of folder.files) {
      const processed = this.processRequest(file);
      requests.push(processed);
    }

    // Recursively process subfolders
    for (const subFolder of folder.folders) {
      const subRequests = this.extractAllRequests(subFolder);
      requests.push(...subRequests);
    }

    // Sort by sequence number
    requests.sort((a, b) => a.meta.seq - b.meta.seq);

    return requests;
  }

  private processRequest(file: BruFile): ProcessedRequest {
    const processed: ProcessedRequest = { ...file };

    // Determine HTTP method and URL
    const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options', 'trace', 'connect'];
    for (const method of methods) {
      if (file[method as keyof BruFile]) {
        processed.method = method.toUpperCase();
        const request = file[method as keyof BruFile] as any;
        processed.url = request?.url;
        // remove all query parameters from processed.url
        processed.url = processed.url.split('?')[0];
        break;
      }
    }

    // Process query parameters
    if (file['params:query']) {
      processed.queryParams = file['params:query'];
    }

    // Process path parameters
    if (file['params:path']) {
      processed.pathParams = file['params:path'];
    }

    // Process authentication
    if (file['auth:basic']) {
      processed.auth = {
        type: 'Basic Authentication',
        details: `Username: ${file['auth:basic'].username}\nPassword: [HIDDEN]`
      };
    } else if (file['auth:bearer']) {
      processed.auth = {
        type: 'Bearer Token',
        details: `Token: ${file['auth:bearer'].token}`
      };
    } else if (file['auth:digest']) {
      processed.auth = {
        type: 'Digest Authentication',
        details: `Username: ${file['auth:digest'].username}\nPassword: [HIDDEN]`
      };
    }

    // Process body
    if (file['body:json']) {
      try {
        processed.body = formatJson(file['body:json'], 'html');
      } catch (error) {
        console.warn(`Failed to parse JSON body for file ${file.meta.name}: ${error}`);
        processed.body = file['body:json'];
      }
    } else if (file['body:text']) {
      processed.body = file['body:text'];
    } else if (file['body:xml']) {
      processed.body = file['body:xml'];
    } else if (file.body) {
      processed.body = file.body;
    }

    // Process scripts
    if (file['script:pre-request'] || file['script:post-response']) {
      processed.scripts = {
        preRequest: file['script:pre-request'],
        postResponse: file['script:post-response']
      };
    }

    return processed;
  }

  private calculateStatsFromCollection(collection: BruCollection, allRequests: ProcessedRequest[]) {
    const httpMethods = new Set<string>();

    allRequests.forEach(request => {
      if (request.method) {
        httpMethods.add(request.method);
      }
    });

    return {
      totalRequests: allRequests.length,
      totalFolders: this.countFoldersInCollection(collection),
      httpMethods: Array.from(httpMethods).sort()
    };
  }

  private countFolders(folder: BruFolder): number {
    let count = folder.folders.length;
    for (const subFolder of folder.folders) {
      count += this.countFolders(subFolder);
    }
    return count;
  }

  private countFoldersInCollection(collection: BruCollection): number {
    let count = collection.folders.length;
    for (const folder of collection.folders) {
      count += this.countFolders(folder);
    }
    return count;
  }

  public render(templatePath: string, data: TemplateData): string {
    const template = this.loadTemplate(templatePath);
    return template(data);
  }

  public renderString(templateString: string, data: Record<string, any>): string {
    const template = this.handlebars.compile(templateString);
    return template(data);
  }
}
