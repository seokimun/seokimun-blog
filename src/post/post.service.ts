import { Injectable, NotFoundException } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import MarkdownIt from 'markdown-it';
import { join } from 'path';

export interface PostSummary {
  slug: string;
  title: string;
  date: string;
}

@Injectable()
export class PostService {
  private md = new MarkdownIt();

  getAllPosts(): PostSummary[] {
    const dirPath = join(process.cwd(), 'posts');

    const files = readdirSync(dirPath).filter((file) => file.endsWith('.md'));

    const posts = files.map((file) => {
      const slug = file.replace(/\.md$/, '');
      const fullPath = join(dirPath, file);

      const content = readFileSync(fullPath, 'utf8');

      let title = slug;
      const match = content.match(/^#\s+(.+)$/m);
      if (match) {
        title = match[1].trim();
      }

      const stats = statSync(fullPath);
      const date = stats.mtime.toISOString().slice(0, 10);

      return { slug, title, date };
    });

    return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }

  getPostHtml(slug: string): string {
    const filePath = join(process.cwd(), 'posts', `${slug}.md`);

    if (!existsSync(filePath)) {
      throw new NotFoundException('Post not found');
    }

    const markdown = readFileSync(filePath, 'utf8');
    return this.md.render(markdown);
  }
}
