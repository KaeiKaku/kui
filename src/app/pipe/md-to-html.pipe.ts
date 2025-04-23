import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import hljs from 'highlight.js';

marked.use({
  renderer: {
    code(this, { text, lang }: { text: string; lang?: string }) {
      return hljs.highlight(text, { language: lang || 'plaintext' }).value;
    },
  },
});

@Pipe({
  name: 'mdToHtml',
  standalone: true,
})
export class MdToHtmlPipe implements PipeTransform {
  mdToHtml(md: string): string {
    return marked.parse(md) as string;
  }

  transform(value: string): string {
    return this.mdToHtml(value);
  }
}
