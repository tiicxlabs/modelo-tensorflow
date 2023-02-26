import { AfterViewInit, OnInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { HandGesture } from './hand-gesture.service';
import * as tf from '@tensorflow/tfjs'; //* comentado porque talvez nao funcione a biblioteca
import * as handpose from '@tensorflow-models/handpose';
import * as stackblur from 'stackblur-canvas';
import { drawKeypoints, drawPoint } from './utilities';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit {
  @ViewChild('canvas') canvasRef: ElementRef;
  @ViewChild('video', { static: true })
  video: ElementRef<HTMLVideoElement>;
  
  async ngOnInit() {
    const handposeModel = await handpose.load();
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    this.video.nativeElement.addEventListener('loadeddata', () => {
      canvas.width = this.video.nativeElement.videoWidth;
      canvas.height = this.video.nativeElement.videoHeight;
      this.video.nativeElement.srcObject = stream;
      this.video.nativeElement.autoplay = true;
      this.video.nativeElement.muted = true;
      this.video.nativeElement.loop = true;
    });
    
  
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '../assets/background.jpg';
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      stackblur.canvasRGB(canvas, 0, 0, canvas.width, canvas.height, 50);
      this.detectHand(handposeModel, this.video, canvas, ctx);
    };
  }

  async detectHand(handposeModel, video, canvas, ctx) {
    const predictions = await handposeModel.estimateHands(video);
    requestAnimationFrame(() => this.detectHand(handposeModel, video, canvas, ctx));
    if (predictions.length > 0) {
      const keypoints = predictions[0].landmarks;
      drawKeypoints(ctx, tf.tensor2d(keypoints, [keypoints.length, 3]), 0.6);
      const [x, y] = keypoints[0];
      const radius = 80;
      const imageData = ctx.getImageData(x - radius, y - radius, radius * 2, radius * 2);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const red = data[i];
        const green = data[i + 1];
        const blue = data[i + 2];
        const alpha = data[i + 3];
        if (alpha > 0) {
          data[i] = red * 0.5 + 255 * 0.5;
          data[i + 1] = green * 0.5 + 255 * 0.5;
          data[i + 2] = blue * 0.5 + 255 * 0.5;
        }
      }
      ctx.putImageData(imageData, x - radius, y - radius);
    }
  }
}