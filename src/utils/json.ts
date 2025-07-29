export function formatJson(value: string, format: 'html' | 'text'): string {
  // Special token types
  enum TokenType {
    OPEN_BRACE,
    CLOSE_BRACE,
    OPEN_BRACKET,
    CLOSE_BRACKET,
    COLON,
    COMMA,
    STRING,
    NUMBER,
    BOOLEAN,
    NULL,
    HANDLEBARS,
    WHITE_SPACE
  }

  interface Token {
    type: TokenType;
    value: string;
  }

  // Tokenizer function
  function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;

    while (i < input.length) {
      // Handle whitespace
      if (/\s/.test(input[i])) {
        let whitespace = '';
        while (i < input.length && /\s/.test(input[i])) {
          whitespace += input[i];
          i++;
        }
        tokens.push({ type: TokenType.WHITE_SPACE, value: whitespace });
        continue;
      }

      // Handle special characters
      switch (input[i]) {
        case '{':
          // Check for handlebars start {{
          if (i + 1 < input.length && input[i + 1] === '{') {
            let handlebars = '{{';
            i += 2;
            while (i < input.length && !(input[i] === '}' && input[i + 1] === '}')) {
              handlebars += input[i];
              i++;
            }
            if (i < input.length) {
              handlebars += '}}';
              i += 2;
            }
            tokens.push({ type: TokenType.HANDLEBARS, value: handlebars });
          } else {
            tokens.push({ type: TokenType.OPEN_BRACE, value: '{' });
            i++;
          }
          break;
        case '}':
          tokens.push({ type: TokenType.CLOSE_BRACE, value: '}' });
          i++;
          break;
        case '[':
          tokens.push({ type: TokenType.OPEN_BRACKET, value: '[' });
          i++;
          break;
        case ']':
          tokens.push({ type: TokenType.CLOSE_BRACKET, value: ']' });
          i++;
          break;
        case ':':
          tokens.push({ type: TokenType.COLON, value: ':' });
          i++;
          break;
        case ',':
          tokens.push({ type: TokenType.COMMA, value: ',' });
          i++;
          break;
        case '"':
          let stringValue = '"';
          i++;
          let isEscaped = false;

          while (i < input.length) {
            // Check for handlebars inside string
            if (input[i] === '{' && input[i + 1] === '{' && !isEscaped) {
              let handlebars = '{{';
              const startIndex = i;
              i += 2;
              while (i < input.length && !(input[i] === '}' && input[i + 1] === '}')) {
                handlebars += input[i];
                i++;
              }
              if (i < input.length) {
                handlebars += '}}';
                i += 2;
                // Add the handlebars as a separate token in the string
                tokens.push({ type: TokenType.STRING, value: stringValue });
                tokens.push({ type: TokenType.HANDLEBARS, value: handlebars });
                stringValue = '';
                continue;
              } else {
                // If we don't find the closing }}, treat as normal characters
                i = startIndex;
              }
            }

            if (input[i] === '\\' && !isEscaped) {
              isEscaped = true;
            } else if (input[i] === '"' && !isEscaped) {
              stringValue += input[i];
              i++;
              break;
            } else {
              if (isEscaped) isEscaped = false;
            }

            stringValue += input[i];
            i++;
          }

          if (stringValue.length > 0) {
            tokens.push({ type: TokenType.STRING, value: stringValue });
          }
          break;
        default:
          // Handle numbers, booleans, and null
          if (/[0-9\-]/.test(input[i])) {
            let number = '';
            while (i < input.length && /[0-9.\-+eE]/.test(input[i])) {
              number += input[i];
              i++;
            }
            tokens.push({ type: TokenType.NUMBER, value: number });
          } else if (input.substring(i, i + 4) === 'true') {
            tokens.push({ type: TokenType.BOOLEAN, value: 'true' });
            i += 4;
          } else if (input.substring(i, i + 5) === 'false') {
            tokens.push({ type: TokenType.BOOLEAN, value: 'false' });
            i += 5;
          } else if (input.substring(i, i + 4) === 'null') {
            tokens.push({ type: TokenType.NULL, value: 'null' });
            i += 4;
          } else {
            // Skip unknown characters
            i++;
          }
      }
    }

    return tokens;
  }

  // Escape HTML special characters
  function escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Format tokens
  function formatTokens(tokens: Token[], isHtml: boolean): string {
    if (!isHtml) {
      // For plain text, just pretty print
      return prettyPrint(tokens);
    }

    let result = '';
    let inKey = false;
    let indentLevel = 0;
    const indent = '  ';

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = i + 1 < tokens.length ? tokens[i + 1] : null;

      switch (token.type) {
        case TokenType.HANDLEBARS:
          result += `<span class="json-handlebars">${escapeHtml(token.value)}</span>`;
          break;
        case TokenType.OPEN_BRACE:
          result += '<span class="json-brace json-brace-open">{</span><div class="json-object">';
          if (nextToken?.type !== TokenType.CLOSE_BRACE) {
            indentLevel++;
            result += '\n' + indent.repeat(indentLevel);
          }
          inKey = true;
          break;
        case TokenType.CLOSE_BRACE:
          if (tokens[i-1]?.type !== TokenType.OPEN_BRACE) {
            indentLevel--;
            result += '\n' + indent.repeat(indentLevel);
          }
          result += '</div><span class="json-brace json-brace-close">}</span>';
          break;
        case TokenType.OPEN_BRACKET:
          result += '<span class="json-bracket json-bracket-open">[</span><div class="json-array">';
          if (nextToken?.type !== TokenType.CLOSE_BRACKET) {
            indentLevel++;
            result += '\n' + indent.repeat(indentLevel);
          }
          break;
        case TokenType.CLOSE_BRACKET:
          if (tokens[i-1]?.type !== TokenType.OPEN_BRACKET) {
            indentLevel--;
            result += '\n' + indent.repeat(indentLevel);
          }
          result += '</div><span class="json-bracket json-bracket-close">]</span>';
          break;
        case TokenType.COLON:
          result += '<span class="json-colon">:</span> ';
          inKey = false;
          break;
        case TokenType.COMMA:
          result += '<span class="json-comma">,</span><br/>\n' + indent.repeat(indentLevel);
          inKey = true;
          break;
        case TokenType.STRING:
          if (inKey) {
            result += `<span class="json-key">${escapeHtml(token.value)}</span>`;
          } else {
            result += `<span class="json-string">${escapeHtml(token.value)}</span>`;
          }
          break;
        case TokenType.NUMBER:
          result += `<span class="json-number">${token.value}</span>`;
          break;
        case TokenType.BOOLEAN:
          result += `<span class="json-boolean">${token.value}</span>`;
          break;
        case TokenType.NULL:
          result += `<span class="json-null">${token.value}</span>`;
          break;
        case TokenType.WHITE_SPACE:
          // Ignore most whitespace as we're controlling formatting
          break;
      }
    }

    return `${result}`;
  }

  // Pretty print for plain text
  function prettyPrint(tokens: Token[]): string {
    let result = '';
    let indentLevel = 0;
    const indent = '  ';

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextToken = i + 1 < tokens.length ? tokens[i + 1] : null;

      switch (token.type) {
        case TokenType.HANDLEBARS:
          result += token.value;
          break;
        case TokenType.OPEN_BRACE:
          result += '{';
          if (nextToken?.type !== TokenType.CLOSE_BRACE) {
            indentLevel++;
            result += '\n' + indent.repeat(indentLevel);
          }
          break;
        case TokenType.CLOSE_BRACE:
          if (tokens[i-1]?.type !== TokenType.OPEN_BRACE) {
            indentLevel--;
            result += '\n' + indent.repeat(indentLevel);
          }
          result += '}';
          break;
        case TokenType.OPEN_BRACKET:
          result += '[';
          if (nextToken?.type !== TokenType.CLOSE_BRACKET) {
            indentLevel++;
            result += '\n' + indent.repeat(indentLevel);
          }
          break;
        case TokenType.CLOSE_BRACKET:
          if (tokens[i-1]?.type !== TokenType.OPEN_BRACKET) {
            indentLevel--;
            result += '\n' + indent.repeat(indentLevel);
          }
          result += ']';
          break;
        case TokenType.COLON:
          result += ': ';
          break;
        case TokenType.COMMA:
          result += ',\n' + indent.repeat(indentLevel);
          break;
        case TokenType.STRING:
        case TokenType.NUMBER:
        case TokenType.BOOLEAN:
        case TokenType.NULL:
          result += token.value;
          break;
        case TokenType.WHITE_SPACE:
          // Ignore most whitespace as we're controlling formatting
          break;
      }
    }

    return result;
  }

  try {
    // Main execution flow
    const tokens = tokenize(value);
    return formatTokens(tokens, format === 'html');
  } catch (error) {
    // If there's an error in parsing, return the original string
    console.error('Error formatting JSON:', error);
    return value;
  }
}
