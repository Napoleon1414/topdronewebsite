import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  galleryImages = [
    'assets/images/DJI_20250630114019_0002_V_map-plan-6862bbbf098abd9b4e09d5b4-wp-2.JPG',
    'assets/images/DJI_20250630120456_0002_V_map-plan-6862c379417f297857ac3126-wp-2.JPG',
    'assets/images/DJI_20250630115134_0002_V_map-plan-6862c05499c6b93c59b05f17-wp-3.JPG',
    'assets/images/DJI_20250630112426_0002_V_map-plan-6862b9fc098abd9b4e09d41e-wp-2.JPG',
    'assets/images/DJI_20250630105624_0002_V_map-plan-6862b33158644d0b550929b3-wp-3.JPG',
    'assets/images/DJI_20250630104904_0004_V_map-plan-6862b1c0acd101d36c2f222e-wp-2.JPG',
    'assets/images/DJI_20250630102956_0002_V_map-plan-6862a6e624172bb8c738be3c-wp-2.JPG',
    'assets/images/DJI_20250630100357_0002_V_map-plan-6862a6e624172bb8c738be3c-wp-2.JPG',
    'assets/images/DJI_20250630093913_0002_V_map-plan-6862a12b24172bb8c738b8a1-wp-2.JPG'
  ];

  carouselImages = [
    'assets/images/DJI_20250630120456_0002_V_map-plan-6862c379417f297857ac3126-wp-2.JPG',
    'assets/images/DJI_20250630115134_0002_V_map-plan-6862c05499c6b93c59b05f17-wp-3.JPG',
    'assets/images/DJI_20250630114019_0002_V_map-plan-6862bbbf098abd9b4e09d5b4-wp-2.JPG',
    'assets/images/DJI_20250630112426_0002_V_map-plan-6862b9fc098abd9b4e09d41e-wp-2.JPG',
    'assets/images/DJI_20250630105624_0002_V_map-plan-6862b33158644d0b550929b3-wp-3.JPG',
    'assets/images/DJI_20250630104904_0004_V_map-plan-6862b1c0acd101d36c2f222e-wp-2.JPG',
    'assets/images/DJI_20250630102956_0002_V_map-plan-6862a6e624172bb8c738be3c-wp-2.JPG',
    'assets/images/DJI_20250630100357_0002_V_map-plan-6862a6e624172bb8c738be3c-wp-2.JPG',
    'assets/images/DJI_20250630093913_0002_V_map-plan-6862a12b24172bb8c738b8a1-wp-2.JPG'
  ];
  carouselIndex = 0;
  carouselInterval: any;
  modalOpen = false;
  selectedImage = 0;
  sliderIndex = 0;
  showMobileMenu = false;
  private countersAnimated = false;




  nextCarousel() {
    this.carouselIndex = (this.carouselIndex + 1) % this.carouselImages.length;
  }

  prevCarousel() {
    this.carouselIndex = (this.carouselIndex - 1 + this.carouselImages.length) % this.carouselImages.length;
  }

  openModal(index: number) {
    this.selectedImage = index;
    this.modalOpen = true;
  }

  closeModal() {
    this.modalOpen = false;
  }

  sliderPrev() {
    this.sliderIndex = (this.sliderIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
  }

  sliderNext() {
    this.sliderIndex = (this.sliderIndex + 1) % this.galleryImages.length;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.carouselInterval = setInterval(() => {
        this.nextCarousel();
      }, 4000);
    }
  }

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  ngAfterViewInit() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.countersAnimated) {
            this.animateCounter('companies-counter', 45, 2000, 0);
            this.animateCounter('missions-counter', 150, 2000, 100);
            this.animateCounter('pictures-counter', 12000, 2200, 200);
            this.countersAnimated = true;
            observer.disconnect();
          }
        });
      }, { threshold: 0.4 });
      const target = document.querySelector('.service-cards');
      if (target) {
        observer.observe(target);
      }
    } else {
      // Fallback: animate immediately
      this.animateCounter('companies-counter', 45, 2000, 0);
      this.animateCounter('missions-counter', 150, 2000, 100);
      this.animateCounter('pictures-counter', 12000, 2200, 200);
    }
  }

  animateCounter(id: string, target: number, duration: number, delay: number = 0) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = 0;
    const increment = target / (duration / 16);
    let lastValue = 0;
    function update() {
      start += increment * (0.7 + 0.3 * Math.sin(start / target * Math.PI)); // ease in-out
      if (start < target) {
        const val = Math.floor(start);
        if (val !== lastValue) {
          el!.textContent = val.toLocaleString();
          el!.style.transform = 'scale(1.18)';
          el!.style.color = '#1976d2';
          setTimeout(() => {
            el!.style.transform = 'scale(1)';
            el!.style.color = '#0a2a66';
          }, 120);
          lastValue = val;
        }
        requestAnimationFrame(update);
      } else {
        el!.textContent = target.toLocaleString();
        el!.style.transform = 'scale(1)';
        el!.style.color = '#0a2a66';
      }
    }
    setTimeout(update, delay);
  }
} 