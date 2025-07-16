import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding:2rem;max-width:900px;margin:0 auto;">
      <div style="text-align:center;margin-bottom:1.5rem;">
        <img src="assets/images/with_black_border_final.jpg" alt="Top Drone Logo" style="height:100px;width:auto;" />
      </div>
      <div *ngIf="!showViewer && !isAuthenticated">
        <h2>Slider Creation Locked</h2>
        <form (ngSubmit)="checkPassword()" #pwForm="ngForm" style="margin-top:2rem;">
          <label>Password:<br>
            <input [(ngModel)]="passwordInput" name="passwordInput" type="password" required style="width:100%;margin-bottom:1rem;" />
          </label>
          <button type="submit">Unlock</button>
        </form>
        <div *ngIf="passwordError" style="color:red;margin-top:1rem;">Incorrect password. Please try again.</div>
      </div>
      <form *ngIf="!showViewer && isAuthenticated" (ngSubmit)="generateLink()" #modelForm="ngForm">
        <label>
          <b>Title:</b>
          <input [(ngModel)]="customTitle" name="customTitle" placeholder="Enter a title for your comparison" style="width:100%;margin-bottom:1rem;" />
        </label>
        <label>
          <b>Mode:</b>
          <select [(ngModel)]="mode" name="mode" required>
            <option value="compare">Compare two models/images</option>
            <option value="single">Post one model/image</option>
          </select>
        </label>
        <div style="margin:1rem 0;">
          <label *ngIf="mode==='compare'">
            Left Model/Image (Sketchfab embed HTML, image URL, or &#64;ImgBB link):<br>
            <textarea [(ngModel)]="leftEmbed" name="leftEmbed" required placeholder="Paste left model embed HTML, image URL, or &#64;ImgBB link here" style="width:100%" rows="4"></textarea>
          </label>
          <br *ngIf="mode==='compare'">
          <label *ngIf="mode==='compare'">
            Right Model/Image (Sketchfab embed HTML, image URL, or &#64;ImgBB link):<br>
            <textarea [(ngModel)]="rightEmbed" name="rightEmbed" required placeholder="Paste right model embed HTML, image URL, or &#64;ImgBB link here" style="width:100%" rows="4"></textarea>
          </label>
          <label *ngIf="mode==='single'">
            Model/Image (Sketchfab embed HTML, image URL, or &#64;ImgBB link):<br>
            <textarea [(ngModel)]="leftEmbed" name="singleEmbed" required placeholder="Paste model embed HTML, image URL, or &#64;ImgBB link here" style="width:100%" rows="4"></textarea>
          </label>
        </div>
        <button type="submit" [disabled]="!modelForm.form.valid">Generate Link</button>
      </form>
      <div *ngIf="shareLink" style="margin-top:2rem;">
        <b>Share this link:</b><br>
        <a [href]="shareLink" target="_blank">{{shareLink}}</a>
      </div>
      <div *ngIf="showViewer">
        <h2 style="text-align:center;">{{ customTitle || 'Share a 3D Model or Image Comparison' }}</h2>
        <ng-container *ngIf="mode==='compare'; else singleModel">
          <div class="curtain-container">
            <div class="curtain-right">
              <div class="sketchfab-embed-wrapper">
                <ng-container *ngIf="isImage(rightRawUrl); else rightIframe">
                  <img [src]="rightRawUrl" style="width:100%;height:100%;object-fit:cover;border-radius:16px 16px 0 0;" />
                </ng-container>
                <ng-template #rightIframe>
                  <iframe [src]="rightUrl" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share></iframe>
                </ng-template>
              </div>
            </div>
            <div class="curtain-left" [ngStyle]="{'clip-path': 'inset(0 0 0 ' + curtainValue + '%)'}">
              <div class="sketchfab-embed-wrapper">
                <ng-container *ngIf="isImage(leftRawUrl); else leftIframe">
                  <img [src]="leftRawUrl" style="width:100%;height:100%;object-fit:cover;border-radius:16px 16px 0 0;" />
                </ng-container>
                <ng-template #leftIframe>
                  <iframe [src]="leftUrl" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share></iframe>
                </ng-template>
              </div>
            </div>
            <input type="range" min="0" max="100" [(ngModel)]="curtainValue" class="curtain-slider" />
          </div>
        </ng-container>
        <ng-template #singleModel>
          <div class="sketchfab-embed-wrapper" style="max-width:900px;margin:2rem auto;">
            <ng-container *ngIf="isImage(leftRawUrl); else singleIframe">
              <img [src]="leftRawUrl" style="width:100%;height:480px;object-fit:cover;border-radius:16px 16px 0 0;" />
            </ng-container>
            <ng-template #singleIframe>
              <iframe [src]="leftUrl" frameborder="0" allowfullscreen mozallowfullscreen="true" webkitallowfullscreen="true" allow="autoplay; fullscreen; xr-spatial-tracking" xr-spatial-tracking execution-while-out-of-viewport execution-while-not-rendered web-share style="width:100%;height:480px;"></iframe>
            </ng-template>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .curtain-container {
      position: relative;
      width: 90vw;
      max-width: 900px;
      height: 480px;
      margin: 2rem auto;
      background: #eee;
      overflow: hidden;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .curtain-left, .curtain-right {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      transition: clip-path 0.2s;
      pointer-events: none;
    }
    .curtain-left {
      z-index: 2;
      pointer-events: auto;
    }
    .curtain-right {
      z-index: 1;
      pointer-events: auto;
    }
    .sketchfab-embed-wrapper {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
    }
    .sketchfab-embed-wrapper img,
    .sketchfab-embed-wrapper iframe {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border: none;
      border-radius: 16px 16px 0 0;
      position: absolute;
      top: 0; left: 0;
    }
    .curtain-slider {
      position: absolute;
      left: 0; right: 0; bottom: 0;
      width: 100%;
      z-index: 10;
      margin: 0 auto;
    }
  `]
})
export class SliderComponent {
  mode: 'compare' | 'single' = 'compare';
  leftEmbed = '';
  rightEmbed = '';
  leftUrl: SafeResourceUrl = '';
  rightUrl: SafeResourceUrl = '';
  leftRawUrl = '';
  rightRawUrl = '';
  curtainValue = 50;
  shareLink: string | null = null;
  showViewer = false;
  customTitle: string = '';
  passwordInput: string = '';
  passwordError: boolean = false;
  isAuthenticated: boolean = false;

  constructor(private location: Location, private sanitizer: DomSanitizer) {
    // Check for query params on load
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const left = params.get('left');
    const right = params.get('right');
    const title = params.get('title');
    if (mode && left) {
      this.mode = mode as any;
      this.leftRawUrl = left;
      this.rightRawUrl = right || '';
      this.leftUrl = this.isImage(left) ? '' : this.sanitize(left);
      this.rightUrl = right && !this.isImage(right) ? this.sanitize(right) : '';
      this.customTitle = title || '';
      this.showViewer = true;
      this.isAuthenticated = true;
    } else {
      // Check sessionStorage for auth
      this.isAuthenticated = sessionStorage.getItem('sliderAuth') === 'true';
    }
  }

  extractSrcOrImage(input: string): string {
    if (!input) return '';
    input = input.trim();
    // If it's an @ImgBB link
    if (input.startsWith('@https://ibb.co/')) {
      // Extract the ID from the URL
      const match = input.match(/^@https:\/\/ibb\.co\/([\w\d]+)/);
      if (match) {
        // We don't know the filename, but ImgBB allows direct access via https://i.ibb.co/ID/image.jpg
        // We'll use a generic .jpg extension, which works for most cases
        return `https://i.ibb.co/${match[1]}/image.jpg`;
      }
    }
    // If it's a direct image URL
    if (this.isImage(input)) return input;
    // Otherwise, try to extract src from embed HTML
    const match = input.match(/src\s*=\s*['\"]([^'\"]+)['\"]/i);
    return match ? match[1] : input;
  }

  isImage(url: string): boolean {
    return /\.(jpe?g|png|webp)$/i.test(url || '');
  }

  generateLink() {
    const leftSrc = this.extractSrcOrImage(this.leftEmbed);
    const rightSrc = this.mode === 'compare' ? this.extractSrcOrImage(this.rightEmbed) : '';
    this.leftRawUrl = leftSrc;
    this.rightRawUrl = rightSrc;
    this.leftUrl = this.isImage(leftSrc) ? '' : this.sanitize(leftSrc);
    this.rightUrl = this.mode === 'compare' && rightSrc && !this.isImage(rightSrc) ? this.sanitize(rightSrc) : '';
    let url = window.location.origin + window.location.pathname + '?mode=' + this.mode + '&left=' + encodeURIComponent(leftSrc);
    if (this.mode === 'compare') {
      url += '&right=' + encodeURIComponent(rightSrc);
    }
    if (this.customTitle) {
      url += '&title=' + encodeURIComponent(this.customTitle);
    }
    this.shareLink = url;
  }

  sanitize(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  checkPassword() {
    if (this.passwordInput === 'Napoleon1426$') {
      this.isAuthenticated = true;
      sessionStorage.setItem('sliderAuth', 'true');
      this.passwordError = false;
    } else {
      this.passwordError = true;
    }
  }
}