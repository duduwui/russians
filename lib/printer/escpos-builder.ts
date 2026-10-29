/**
 * Standard ESC/POS Command Byte Builder for 80mm Thermal Receipt Printers (48 cols)
 */
export class EscPosBuilder {
  private buffer: number[] = [];

  // Reset printer to default state: ESC @ (0x1B 0x40)
  init(): this {
    this.buffer.push(0x1b, 0x40);
    return this;
  }

  // Open / Kick Cash Drawer: ESC p 0 25 250 (0x1B 0x70 0x00 0x19 0xFA)
  // Pin 2, 50ms pulse on, 500ms pulse off
  openDrawer(): this {
    this.buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa);
    return this;
  }

  // Text Alignment: ESC a n (0: Left, 1: Center, 2: Right)
  align(alignment: "left" | "center" | "right"): this {
    const code = alignment === "center" ? 1 : alignment === "right" ? 2 : 0;
    this.buffer.push(0x1b, 0x61, code);
    return this;
  }

  // Bold On / Off: ESC E n
  bold(enable: boolean): this {
    this.buffer.push(0x1b, 0x45, enable ? 1 : 0);
    return this;
  }

  // Underline: ESC - n
  underline(enable: boolean): this {
    this.buffer.push(0x1b, 0x2d, enable ? 1 : 0);
    return this;
  }

  // Text Size: GS ! n (0: normal, 0x11: double width + height)
  textSize(size: "normal" | "double"): this {
    this.buffer.push(0x1d, 0x21, size === "double" ? 0x11 : 0x00);
    return this;
  }

  // Add raw text
  text(str: string): this {
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      // For basic ASCII printing
      this.buffer.push(code < 128 ? code : 0x3f);
    }
    return this;
  }

  // Add text with newline
  textLine(str = ""): this {
    this.text(str);
    this.buffer.push(0x0a); // LF
    return this;
  }

  // Feed n lines: ESC d n
  feed(lines = 1): this {
    this.buffer.push(0x1b, 0x64, lines);
    return this;
  }

  // Two column line (e.g. "Subtotal       $24.00")
  twoColumn(left: string, right: string, width = 48): this {
    const spaceCount = Math.max(1, width - left.length - right.length);
    const line = left + " ".repeat(spaceCount) + right;
    return this.textLine(line);
  }

  // Three column line (e.g. "Apple" "2 x $12.00" "$24.00")
  threeColumn(col1: string, col2: string, col3: string, width = 48): this {
    const col3Formatted = col3.padStart(10);
    const col2Formatted = col2.padEnd(16);
    const remaining = Math.max(1, width - col3Formatted.length - col2Formatted.length);
    const col1Formatted = col1.slice(0, remaining).padEnd(remaining);
    return this.textLine(col1Formatted + col2Formatted + col3Formatted);
  }

  // Divider line
  divider(char = "-", width = 48): this {
    return this.textLine(char.repeat(width));
  }

  // Cut Paper: GS V 65 0 (Partial/Full Cut)
  cut(): this {
    this.feed(3);
    this.buffer.push(0x1d, 0x56, 0x41, 0x00);
    return this;
  }

  // Build Uint8Array
  getBytes(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  // Convert to formatted hex dump string for debugging
  toHexDump(): string {
    return Array.from(this.buffer)
      .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
      .join(" ");
  }
}
