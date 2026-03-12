import { Component, OnInit, OnDestroy, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WORDS } from '../words';

interface Word {
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  baseAngle: number;
  speed: number;
  radius: number;
  centerX: number;
  centerY: number;
}

// Simple hash function that returns a value between 0 and 1
function hashString(str: string, seed: number = 0): number {
  str = "nonce" + str + "salt"
  let hash = seed;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  // Convert to 0-1 range
  return (hash >>> 0) / 4294967295;
}

@Component({
    selector: 'app-word-cloud',
    imports: [CommonModule],
    templateUrl: './word-cloud.component.html',
    styleUrl: './word-cloud.component.css'
})
export class WordCloudComponent implements OnInit, OnDestroy {
  words = signal<Word[]>([]);
  private animationId: number | null = null;
  private colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9'
  ];

  ngOnInit(): void {
    this.loadWords();
  }

  @HostListener('window:resize')
  onResize(): void {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    this.words.update(words => words.map(word => ({
      ...word,
      centerX,
      centerY
    })));
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private loadWords(): void {
    const wordList = WORDS.split('\n').filter(word => word.trim() !== '');
    this.initializeWords(wordList);
    this.animate();
  }

  private initializeWords(wordList: string[]): void {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    this.words.set(wordList.map((text, index) => {
      const trimmedText = text.trim();
      // Use different seeds for each property to get independent pseudo-random values
      const sizeRand = hashString(trimmedText, 1);
      const angleRand = hashString(trimmedText, 2);
      const speedRand = hashString(trimmedText, 3);
      const radiusRand = hashString(trimmedText, 4);

      return {
        text: trimmedText,
        x: 0,
        y: 0,
        size: sizeRand * 24 + 16,
        color: this.colors[Math.floor(hashString(trimmedText, 5) * this.colors.length)],
        baseAngle: (Math.PI * 2 * index) / wordList.length + angleRand * 0.5,
        speed: 0.12 + speedRand * 0.06,
        radius: 100 + radiusRand * 250,
        centerX: centerX,
        centerY: centerY
      };
    }));
  }

  private animate(): void {
    const update = () => {
      // Use absolute time so position is deterministic across reloads
      const currentTime = Date.now() / 1000;

      this.words.update(words => words.map(word => {
        const angle = word.baseAngle + (currentTime * word.speed);
        return {
          ...word,
          x: word.centerX + Math.cos(angle) * word.radius,
          y: word.centerY + Math.sin(angle) * word.radius
        };
      }));
      this.animationId = requestAnimationFrame(update);
    };
    update();
  }

  getWordStyle(word: Word): { [key: string]: string } {
    return {
      'position': 'absolute',
      'left': `${word.x}px`,
      'top': `${word.y}px`,
      'font-size': `${word.size}px`,
      'color': word.color,
      'transform': 'translate(-50%, -50%)',
      'white-space': 'nowrap',
      'font-weight': 'bold',
      'text-shadow': '2px 2px 4px rgba(0,0,0,0.3)',
      'transition': 'left 0.05s linear, top 0.05s linear'
    };
  }
}
