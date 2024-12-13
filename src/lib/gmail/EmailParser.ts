// import { gmail_v1 } from "googleapis";
// import { convert } from "html-to-text";
// import { JSDOM } from "jsdom";

// interface Email {
//   id: string;
//   from: string;
//   fromName: string;
//   subject: string;
//   body: string;
//   to: string;
//   date: Date;
// }

// export class EmailParser {
//   private cleanHtml(html: string): string {
//     const dom = new JSDOM(html);
//     const document = dom.window.document;

//     // Remove script and style elements
//     const scriptsAndStyles = document.querySelectorAll("script, style");
//     scriptsAndStyles.forEach((el) => el.remove());

//     // Remove all attributes except 'href' from anchors
//     const allElements = document.querySelectorAll("*");
//     allElements.forEach((el) => {
//       if (el.tagName.toLowerCase() === "a") {
//         const href = el.getAttribute("href");
//         for (let i = el.attributes.length - 1; i >= 0; i--) {
//           const attr = el.attributes[i];
//           if (attr.name !== "href") {
//             el.removeAttribute(attr.name);
//           }
//         }
//         if (href) el.setAttribute("href", href);
//       } else {
//         while (el.attributes.length > 0) {
//           el.removeAttribute(el.attributes[0].name);
//         }
//       }
//     });

//     return document.body.innerHTML;
//   }

//   private convertHtmlToText(html: string): string {
//     const cleanedHtml = this.cleanHtml(html);
//     return convert(cleanedHtml, {
//       wordwrap: 130,
//       selectors: [
//         { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
//         { selector: "img", format: "skip" },
//       ],
//     });
//   }

//   private removeExtraNewlines(text: string): string {
//     return text.replace(/\n{3,}/g, "\n\n").trim();
//   }

//   private removeLinks(text: string): string {
//     // Remove URLs
//     text = text.replace(/https?:\/\/\S+/gi, "");

//     // Remove email addresses
//     text = text.replace(/[\w.-]+@[\w.-]+\.\w+/gi, "");

//     // Remove any remaining text within angle brackets (often used for links)
//     text = text.replace(/<[^>]+>/g, "");

//     // Remove multiple spaces and trim
//     text = text.replace(/\s+/g, " ").trim();

//     return text;
//   }

//   async parseMessage(message: gmail_v1.Schema$Message): Promise<Email> {
//     const headers = message.payload?.headers || [];
//     const from = headers.find((h) => h.name?.toLowerCase() === "from");
//     const to = headers.find((h) => h.name?.toLowerCase() === "to");
//     const subject = headers.find((h) => h.name?.toLowerCase() === "subject");
//     const date = headers.find((h) => h.name?.toLowerCase() === "date");

//     const fromParts = from?.value?.match(/^(?:(.+) )?<?(.+@[^>]+)>?$/);
//     const fromName = fromParts ? fromParts[1] || "" : "";
//     const fromEmail = fromParts ? fromParts[2] : from?.value || "";

//     let body = "";
//     if (message.payload) {
//       if (message.payload.body?.data) {
//         body = Buffer.from(message.payload.body.data, "base64").toString(
//           "utf-8"
//         );
//       } else if (message.payload.parts) {
//         const htmlPart = message.payload.parts.find(
//           (part) => part.mimeType === "text/html"
//         );
//         const textPart = message.payload.parts.find(
//           (part) => part.mimeType === "text/plain"
//         );

//         if (htmlPart && htmlPart.body?.data) {
//           body = Buffer.from(htmlPart.body.data, "base64").toString("utf-8");
//           body = this.convertHtmlToText(body);
//         } else if (textPart && textPart.body?.data) {
//           body = Buffer.from(textPart.body.data, "base64").toString("utf-8");
//         }
//       }
//     }

//     body = this.removeLinks(body);
//     body = this.removeExtraNewlines(body);

//     return {
//       id: message.id || "",
//       from: fromEmail,
//       fromName: fromName,
//       subject: subject?.value || "",
//       body: body,
//       to: to?.value || "",
//       date: new Date(date?.value || ""),
//     };
//   }
// }
// import { gmail_v1 } from "googleapis";
// import { convert } from "html-to-text";
// import * as cheerio from "cheerio";
// import { sanitize } from "isomorphic-dompurify";

// interface Email {
//   id: string;
//   from: string;
//   fromName: string;
//   subject: string;
//   body: string;
//   to: string;
//   date: Date;
// }

// export class EmailParser {
//   private cleanHtml(html: string): string {
//     // Sanitize HTML to remove potentially malicious content
//     const sanitizedHtml = sanitize(html);
    
//     const $ = cheerio.load(sanitizedHtml);
  
//     // Remove script, style, and link elements
//     $("script, style, link").remove();
  
//     // Remove all attributes except 'href' from anchors
//     $("*").each((_, el) => {
//       if (el.tagName.toLowerCase() === "a") {
//         const href = $(el).attr("href");
//         $(el).removeAttr();
//         if (href) {
//           $(el).attr("href", href);
//         }
//       } else {
//         $(el).removeAttr();
//       }
//     });
  
//     // Remove comments
//     $("*").contents().filter(function() {
//       return this.type === "comment";
//     }).remove();
  
//     return $.html();
//   }

//   private convertHtmlToText(html: string): string {
//     const cleanedHtml = this.cleanHtml(html);
//     return convert(cleanedHtml, {
//       wordwrap: 130,
//       selectors: [
//         { selector: "a", options: { hideLinkHrefIfSameAsText: true } },
//         { selector: "img", format: "skip" },
//       ],
//       preserveNewlines: true,
//     });
//   }

//   private removeExtraNewlines(text: string): string {
//     return text.replace(/\n{3,}/g, "\n\n").trim();
//   }

//   private removeLinks(text: string): string {
//     // Remove URLs
//     text = text.replace(/https?:\/\/\S+/gi, "");

//     // Remove email addresses
//     text = text.replace(/[\w.-]+@[\w.-]+\.\w+/gi, "");

//     // Remove any remaining text within angle brackets (often used for links)
//     text = text.replace(/<[^>]+>/g, "");

//     // Remove multiple spaces and trim
//     text = text.replace(/\s+/g, " ").trim();

//     return text;
//   }

//   private decodeBase64(data: string): string {
//     return Buffer.from(data, "base64").toString("utf-8");
//   }

//   async parseMessage(message: gmail_v1.Schema$Message): Promise<Email> {
//     const headers = message.payload?.headers || [];
//     const from = headers.find((h) => h.name?.toLowerCase() === "from");
//     const to = headers.find((h) => h.name?.toLowerCase() === "to");
//     const subject = headers.find((h) => h.name?.toLowerCase() === "subject");
//     const date = headers.find((h) => h.name?.toLowerCase() === "date");

//     const fromParts = from?.value?.match(/^(?:(.+) )?<?([\w.-]+@[\w.-]+\.\w+)>?$/);
//     const fromName = fromParts ? fromParts[1] || "" : "";
//     const fromEmail = fromParts ? fromParts[2] : from?.value || "";

//     let body = "";
//     if (message.payload) {
//       if (message.payload.body?.data) {
//         body = this.decodeBase64(message.payload.body.data);
//       } else if (message.payload.parts) {
//         const htmlPart = message.payload.parts.find(
//           (part) => part.mimeType === "text/html"
//         );
//         const textPart = message.payload.parts.find(
//           (part) => part.mimeType === "text/plain"
//         );

//         if (htmlPart && htmlPart.body?.data) {
//           body = this.decodeBase64(htmlPart.body.data);
//           body = this.convertHtmlToText(body);
//         } else if (textPart && textPart.body?.data) {
//           body = this.decodeBase64(textPart.body.data);
//         }
//       }
//     }

//     body = this.removeLinks(body);
//     body = this.removeExtraNewlines(body);

//     return {
//       id: message.id || "",
//       from: fromEmail,
//       fromName: fromName,
//       subject: subject?.value || "",
//       body: body,
//       to: to?.value || "",
//       date: new Date(date?.value || ""),
//     };
//   }
// }

import { gmail_v1 } from "googleapis";
import { convert } from "html-to-text";
import { JSDOM } from "jsdom";
import sanitizeHtml from "sanitize-html";

interface Email {
  id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
  to: string;
  date: Date;
}

export class EmailParser {
  private removeCSSContent(html: string): string {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Remove all <style> tags
    document.querySelectorAll('style').forEach(el => el.remove());

    // Remove all inline styles
    document.querySelectorAll('*').forEach(el => {
      el.removeAttribute('style');
    });

    // Remove class attributes
    document.querySelectorAll('*').forEach(el => {
      el.removeAttribute('class');
    });

    return document.body.innerHTML;
  }

  private sanitizeHtml(html: string): string {
    const cssRemovedHtml = this.removeCSSContent(html);
    return sanitizeHtml(cssRemovedHtml, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      allowedAttributes: {
        'a': ['href']
      },
      selfClosing: ['br'],
      allowedSchemes: ['http', 'https', 'mailto'],
      allowProtocolRelative: true
    });
  }

  private convertHtmlToText(html: string): string {
    const sanitizedHtml = this.sanitizeHtml(html);
    return convert(sanitizedHtml, {
      wordwrap: 130,
      selectors: [
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
        { selector: 'img', format: 'skip' }
      ]
    });
  }

  private cleanText(text: string): string {
    // Remove extra whitespace and newlines
    text = text.replace(/\s+/g, ' ').trim();
    // Remove multiple newlines
    text = text.replace(/\n{3,}/g, '\n\n');
    // Remove URLs
    text = text.replace(/https?:\/\/\S+/gi, '');
    // Remove email addresses
    text = text.replace(/[\w.-]+@[\w.-]+\.\w+/gi, '');
    // Remove any remaining text within angle brackets
    text = text.replace(/<[^>]+>/g, '');
    return text.trim();
  }

  private decodeBase64(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
  }

  private extractBodyContent(payload: gmail_v1.Schema$MessagePart): string {
    if (payload.body?.data) {
      return this.decodeBase64(payload.body.data);
    }
    if (payload.parts) {
      const htmlPart = payload.parts.find(part => part.mimeType === 'text/html');
      const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
      if (htmlPart?.body?.data) {
        return this.convertHtmlToText(this.decodeBase64(htmlPart.body.data));
      }
      if (textPart?.body?.data) {
        return this.decodeBase64(textPart.body.data);
      }
    }
    return '';
  }

  async parseMessage(message: gmail_v1.Schema$Message): Promise<Email> {
    const headers = message.payload?.headers || [];
    const getHeader = (name: string) => headers.find(h => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

    const from = getHeader('from');
    const fromMatch = from.match(/^(?:(.+) )?<(.+)>$/);
    const fromName = fromMatch ? fromMatch[1] || '' : '';
    const fromEmail = fromMatch ? fromMatch[2] : from;

    let body = this.extractBodyContent(message.payload!);
    body = this.cleanText(body);

    return {
      id: message.id || '',
      from: fromEmail,
      fromName: fromName,
      subject: getHeader('subject'),
      body: body,
      to: getHeader('to'),
      date: new Date(getHeader('date'))
    };
  }
}