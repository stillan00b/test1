import { Component } from '@angular/core';
import { WordCloudComponent } from './word-cloud/word-cloud.component';

@Component({
    selector: 'app-root',
    imports: [WordCloudComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'word-cloud-app';
}
