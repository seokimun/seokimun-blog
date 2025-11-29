import { Controller, Get, Header, Param } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { PostService } from './post.service';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  getPosts() {
    return this.postService.getAllPosts();
  }

  @Get('/:slug')
  @Header('Content-Type', 'text/html; charset=utf-8')
  getPostPage(@Param('slug') slug: string): string {
    const contentHtml = this.postService.getPostHtml(slug);

    const templatePath = join(
      process.cwd(),
      'public',
      'pages',
      'post-detail.html',
    );

    let template = readFileSync(templatePath, 'utf8');

    template = template
      .replace('{{title}}', `${slug} · seokimun`)
      .replace('{{content}}', contentHtml);

    return template;
  }
}
