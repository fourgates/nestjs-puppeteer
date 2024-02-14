import { Controller, Get, Res } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('print')
  async pringMe(@Res() res) {
    const content = `
    <!DOCTYPE html>
    <html>
    <body>
    FINDME!!!
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
    
    </body>
    </html>    
    `;
    const pdf = await this.printPDFForStaticContent(content);

    res.set({
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': pdf.length,

      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    });

    res.end(pdf);
  }

  async printPDFForUrl(url: string) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });
    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdf;
  }
  async printPDFForStaticContent(content: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(content);
    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdf;
  }
}
