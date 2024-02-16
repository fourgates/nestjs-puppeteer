import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import puppeteer, { PDFOptions } from 'puppeteer';
import { AppService } from './app.service';

interface PrintForm {
  html: string;
  filename: string;
  options: PDFOptions;
}
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('print/test')
  async printMeTest(@Res() res) {
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
    const pdf = await this.printPDFForStaticContent(content, { format: 'A4' });

    res.set(this.getResponseHeaders('demo.pdf', pdf.length));

    res.end(pdf);
  }

  @Post('print')
  async printMe(@Body() form: PrintForm, @Res() res) {
    const pdf = await this.printPDFForStaticContent(form.html, form.options);

    res.set(this.getResponseHeaders(form.filename, pdf.length));

    res.status(HttpStatus.OK).end(pdf);
    //res.status(HttpStatus.OK).send(ingredients);
  }

  private async printPDFForUrl(url: string) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, {
      waitUntil: 'networkidle0',
    });
    const pdf = await page.pdf({ format: 'A4' });

    await browser.close();
    return pdf;
  }
  private async printPDFForStaticContent(content: string, options: PDFOptions) {
    const browser = await puppeteer.launch({
      headless: true,
      // may ne needed for non-headless mac
      //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--no-sandbox'], // no sandbox needed for docker / linux
    });
    const page = await browser.newPage();

    await page.setContent(content);
    const pdf = await page.pdf(options);

    await browser.close();
    return pdf;
  }

  private getLaunchConfigForMac() {}
  private getResponseHeaders(filename: string, contentLength: number) {
    return {
      // pdf
      'Content-Type': 'application/pdf',
      'Content-Disposition': `'attachment; filename=${filename}.pdf'`,
      'Content-Length': contentLength,

      // prevent cache
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: 0,
    };
  }
}
