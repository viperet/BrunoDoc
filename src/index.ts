#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json' assert { type: 'json' };
import { buildCommand } from './commands/build.js';
import type { BuildOptions } from './types/index.js';

const program = new Command();

// Configure the main program
program
  .name('bruno-docs-cli')
  .description('A TypeScript console application for Bruno documentation')
  .version(version);

// Add another command with arguments
program
  .command('build')
  .description('Process a file')
  .option('-i, --input <path>', 'Bruno directory path', './Collection')
  .option('-o, --output <path_or_file>', 'output documentation path or file name', './docs')
  .option('-f, --format <type>', 'output format (html/md)', 'html')
  .option('-x, --exclude <patterns...>', 'exclude certain files or directories')
  .option('-v, --verbose', 'verbose output')
  .action((options: BuildOptions) => {
    buildCommand(options);
  });

// Parse command line arguments
program.parse();
