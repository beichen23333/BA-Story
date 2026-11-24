// 主线 VOL 轨道：纵向输入映射为横向滚动。
export function isVerticalDominantGesture(deltaX, deltaY) {
    return Math.abs(deltaY) > Math.abs(deltaX);
}

// 章节话数列表沿“右上”方向排列；将拖动量投影到该斜向轨道，返回对应的行步进量。
export function getDiagonalScrollProgress(deltaX, deltaY, horizontalStep, verticalStep) {
    const lengthSquared = horizontalStep * horizontalStep + verticalStep * verticalStep;
    if (!lengthSquared || deltaX * deltaY >= 0) return 0;
    const along = (horizontalStep * deltaX - verticalStep * deltaY) / lengthSquared;
    const across = (verticalStep * deltaX + horizontalStep * deltaY) / lengthSquared;
    return Math.abs(along) >= Math.abs(across) * 0.65 ? along : 0;
}
