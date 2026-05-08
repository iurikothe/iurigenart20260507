// Hash-seeded PRNG for ArtBlocks projects.
// Uses sfc32 seeded with two halves of tokenData.hash so all randomness is
// reproducible from the 32-byte hash alone — no Math.random anywhere.
class Random {
  constructor() {
    this.useA = false;
    const sfc32 = (uint128Hex) => {
      let a = parseInt(uint128Hex.substr(0, 8), 16);
      let b = parseInt(uint128Hex.substr(8, 8), 16);
      let c = parseInt(uint128Hex.substr(16, 8), 16);
      let d = parseInt(uint128Hex.substr(24, 8), 16);
      return () => {
        a |= 0; b |= 0; c |= 0; d |= 0;
        const t = (((a + b) | 0) + d) | 0;
        d = (d + 1) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
      };
    };
    // tokenData.hash looks like "0x" + 64 hex chars; take two 32-char halves.
    this.prngA = sfc32(tokenData.hash.substr(2, 32));
    this.prngB = sfc32(tokenData.hash.substr(34, 32));
    // Warm up both streams.
    for (let i = 0; i < 1e6; i += 2) {
      this.prngA();
      this.prngB();
    }
  }

  // 0 <= n < 1 — alternates between the two streams for added decorrelation.
  random_dec() {
    this.useA = !this.useA;
    return this.useA ? this.prngA() : this.prngB();
  }

  // a <= n < b
  random_num(a, b) {
    return a + (b - a) * this.random_dec();
  }

  // a <= n <= b (integer)
  random_int(a, b) {
    return Math.floor(this.random_num(a, b + 1));
  }

  // bool with given probability of true (default 0.5)
  random_bool(p = 0.5) {
    return this.random_dec() < p;
  }

  random_choice(arr) {
    return arr[this.random_int(0, arr.length - 1)];
  }
}
