import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WordCloudComponent } from './word-cloud.component';

describe('WordCloudComponent', () => {
  let component: WordCloudComponent;
  let fixture: ComponentFixture<WordCloudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WordCloudComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load words on init', () => {
    fixture.detectChanges();
    expect(component.words().length).toBeGreaterThan(0);
  });

  it('should assign consistent colors based on word hash', () => {
    fixture.detectChanges();
    const words = component.words();
    
    // Find a specific word and record its color
    const onaWord = words.find(w => w.text === 'Ona');
    expect(onaWord).toBeTruthy();
    const onaColor = onaWord!.color;

    // Reinitialize and verify same color
    fixture.destroy();
    fixture = TestBed.createComponent(WordCloudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const onaWordAgain = component.words().find(w => w.text === 'Ona');
    expect(onaWordAgain!.color).toBe(onaColor);
  });

  it('should return correct style object from getWordStyle', () => {
    fixture.detectChanges();
    const word = component.words()[0];
    const style = component.getWordStyle(word);

    expect(style['position']).toBe('absolute');
    expect(style['color']).toBe(word.color);
    expect(style['font-size']).toBe(`${word.size}px`);
    expect(style['left']).toBe(`${word.x}px`);
    expect(style['top']).toBe(`${word.y}px`);
  });

  it('should cancel animation frame on destroy', () => {
    const cancelSpy = spyOn(window, 'cancelAnimationFrame');
    fixture.detectChanges();
    fixture.destroy();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should render word elements in template', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const wordElements = compiled.querySelectorAll('.word');
    expect(wordElements.length).toBe(component.words().length);
  });

  it('should update centerX and centerY on window resize', () => {
    fixture.detectChanges();
    const initialCenterX = component.words()[0].centerX;
    const initialCenterY = component.words()[0].centerY;

    // Simulate resize by calling onResize directly (window dimensions don't change in tests)
    component.onResize();

    // centerX/Y should be recalculated (values depend on test window size)
    const words = component.words();
    words.forEach(word => {
      expect(word.centerX).toBe(window.innerWidth / 2);
      expect(word.centerY).toBe(window.innerHeight / 2);
    });
  });

  it('should assign word sizes within expected range (16-40px)', () => {
    fixture.detectChanges();
    component.words().forEach(word => {
      expect(word.size).toBeGreaterThanOrEqual(16);
      expect(word.size).toBeLessThanOrEqual(40);
    });
  });

  it('should assign word speeds within expected range (0.12-0.18)', () => {
    fixture.detectChanges();
    component.words().forEach(word => {
      expect(word.speed).toBeGreaterThanOrEqual(0.12);
      expect(word.speed).toBeLessThanOrEqual(0.18);
    });
  });

  it('should assign word radii within expected range (100-350)', () => {
    fixture.detectChanges();
    component.words().forEach(word => {
      expect(word.radius).toBeGreaterThanOrEqual(100);
      expect(word.radius).toBeLessThanOrEqual(350);
    });
  });

  it('should only assign colors from the predefined color palette', () => {
    fixture.detectChanges();
    const validColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9'
    ];
    component.words().forEach(word => {
      expect(validColors).toContain(word.color);
    });
  });

  it('should not include empty strings as words', () => {
    fixture.detectChanges();
    component.words().forEach(word => {
      expect(word.text.trim().length).toBeGreaterThan(0);
    });
  });
});
