// import * as tf from '@tensorflow/tfjs-core';
import * as tf from '@tensorflow/tfjs';

export function drawKeypoints(ctx: CanvasRenderingContext2D, keypoints: tf.Tensor2D, minConfidence: number) {
  keypoints.array().then(points => {
    for (let i = 0; i < points.length; i++) {
      const y = points[i][0];
      const x = points[i][1];
      if (points[i][2] > minConfidence) {
        drawPoint(ctx, y, x, 3, 'red');
      }
    }
  });
}

export function drawPoint(ctx: CanvasRenderingContext2D, y: number, x: number, r: number, color: string) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();
}
