/*
* Copyright (c) 2011 Erin Catto http://box2d.org
*
* This software is provided 'as-is', without any express or implied
* warranty.  In no event will the authors be held liable for any damages
* arising from the use of this software.
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
* 1. The origin of this software must not be misrepresented; you must not
* claim that you wrote the original software. If you use this software
* in a product, an acknowledgment in the product documentation would be
* appreciated but is not required.
* 2. Altered source versions must be plainly marked as such, and must not be
* misrepresented as being the original software.
* 3. This notice may not be removed or altered from any source distribution.
*/
System.register([], function (exports_1, context_1) {
    "use strict";
    var b2Color, b2DrawFlags, b2Draw;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
            /// Color for debug drawing. Each value has the range [0,1].
            b2Color = class b2Color {
                constructor(rr = 0.5, gg = 0.5, bb = 0.5, aa = 1.0) {
                    this.r = rr;
                    this.g = gg;
                    this.b = bb;
                    this.a = aa;
                }
                Clone() {
                    return new b2Color().Copy(this);
                }
                Copy(other) {
                    this.r = other.r;
                    this.g = other.g;
                    this.b = other.b;
                    this.a = other.a;
                    return this;
                }
                IsEqual(color) {
                    return (this.r === color.r) && (this.g === color.g) && (this.b === color.b) && (this.a === color.a);
                }
                IsZero() {
                    return (this.r === 0) && (this.g === 0) && (this.b === 0) && (this.a === 0);
                }
                GetColor(out) {
                    out.Copy(this);
                    return out;
                }
                SetColor(color) {
                    this.Copy(color);
                }
                Set(a0, a1, a2, a3 = 1.0) {
                    if (a0 instanceof b2Color) {
                        this.Copy(a0);
                    }
                    else {
                        this.SetRGBA(a0, a1, a2, a3);
                    }
                }
                SetByteRGB(r, g, b) {
                    this.r = r / 0xff;
                    this.g = g / 0xff;
                    this.b = b / 0xff;
                    return this;
                }
                SetByteRGBA(r, g, b, a) {
                    this.r = r / 0xff;
                    this.g = g / 0xff;
                    this.b = b / 0xff;
                    this.a = a / 0xff;
                    return this;
                }
                SetRGB(rr, gg, bb) {
                    this.r = rr;
                    this.g = gg;
                    this.b = bb;
                    return this;
                }
                SetRGBA(rr, gg, bb, aa) {
                    this.r = rr;
                    this.g = gg;
                    this.b = bb;
                    this.a = aa;
                    return this;
                }
                SelfAdd(color) {
                    this.r += color.r;
                    this.g += color.g;
                    this.b += color.b;
                    this.a += color.a;
                    return this;
                }
                Add(color, out) {
                    out.r = this.r + color.r;
                    out.g = this.g + color.g;
                    out.b = this.b + color.b;
                    out.a = this.a + color.a;
                    return out;
                }
                SelfSub(color) {
                    this.r -= color.r;
                    this.g -= color.g;
                    this.b -= color.b;
                    this.a -= color.a;
                    return this;
                }
                Sub(color, out) {
                    out.r = this.r - color.r;
                    out.g = this.g - color.g;
                    out.b = this.b - color.b;
                    out.a = this.a - color.a;
                    return out;
                }
                SelfMul_0_1(s) {
                    this.r *= s;
                    this.g *= s;
                    this.b *= s;
                    this.a *= s;
                    return this;
                }
                Mul_0_1(s, out) {
                    out.r = this.r * s;
                    out.g = this.g * s;
                    out.b = this.b * s;
                    out.a = this.a * s;
                    return this;
                }
                Mix(mixColor, strength) {
                    b2Color.MixColors(this, mixColor, strength);
                }
                static MixColors(colorA, colorB, strength) {
                    const dr = (strength * (colorB.r - colorA.r));
                    const dg = (strength * (colorB.g - colorA.g));
                    const db = (strength * (colorB.b - colorA.b));
                    const da = (strength * (colorB.a - colorA.a));
                    colorA.r += dr;
                    colorA.g += dg;
                    colorA.b += db;
                    colorA.a += da;
                    colorB.r -= dr;
                    colorB.g -= dg;
                    colorB.b -= db;
                    colorB.a -= da;
                }
                MakeStyleString(alpha = this.a) {
                    return b2Color.MakeStyleString(this.r, this.g, this.b, alpha);
                }
                static MakeStyleString(r, g, b, a = 1.0) {
                    // function clamp(x: number, lo: number, hi: number) { return x < lo ? lo : hi < x ? hi : x; }
                    r *= 255; // r = clamp(r, 0, 255);
                    g *= 255; // g = clamp(g, 0, 255);
                    b *= 255; // b = clamp(b, 0, 255);
                    // a = clamp(a, 0, 1);
                    if (a < 1) {
                        return `rgba(${r},${g},${b},${a})`;
                    }
                    else {
                        return `rgb(${r},${g},${b})`;
                    }
                }
            };
            b2Color.RED = new b2Color(1, 0, 0);
            b2Color.GREEN = new b2Color(0, 1, 0);
            b2Color.BLUE = new b2Color(0, 0, 1);
            exports_1("b2Color", b2Color);
            (function (b2DrawFlags) {
                b2DrawFlags[b2DrawFlags["e_none"] = 0] = "e_none";
                b2DrawFlags[b2DrawFlags["e_shapeBit"] = 1] = "e_shapeBit";
                b2DrawFlags[b2DrawFlags["e_jointBit"] = 2] = "e_jointBit";
                b2DrawFlags[b2DrawFlags["e_aabbBit"] = 4] = "e_aabbBit";
                b2DrawFlags[b2DrawFlags["e_pairBit"] = 8] = "e_pairBit";
                b2DrawFlags[b2DrawFlags["e_centerOfMassBit"] = 16] = "e_centerOfMassBit";
                // #if B2_ENABLE_PARTICLE
                b2DrawFlags[b2DrawFlags["e_particleBit"] = 32] = "e_particleBit";
                // #endif
                b2DrawFlags[b2DrawFlags["e_controllerBit"] = 64] = "e_controllerBit";
                b2DrawFlags[b2DrawFlags["e_all"] = 63] = "e_all";
            })(b2DrawFlags || (b2DrawFlags = {}));
            exports_1("b2DrawFlags", b2DrawFlags);
            /// Implement and register this class with a b2World to provide debug drawing of physics
            /// entities in your game.
            b2Draw = class b2Draw {
                constructor() {
                    this.m_drawFlags = 0;
                }
                SetFlags(flags) {
                    this.m_drawFlags = flags;
                }
                GetFlags() {
                    return this.m_drawFlags;
                }
                AppendFlags(flags) {
                    this.m_drawFlags |= flags;
                }
                ClearFlags(flags) {
                    this.m_drawFlags &= ~flags;
                }
                PushTransform(xf) { }
                PopTransform(xf) { }
                DrawPolygon(vertices, vertexCount, color) { }
                DrawSolidPolygon(vertices, vertexCount, color) { }
                DrawCircle(center, radius, color) { }
                DrawSolidCircle(center, radius, axis, color) { }
                // #if B2_ENABLE_PARTICLE
                DrawParticles(centers, radius, colors, count) { }
                // #endif
                DrawSegment(p1, p2, color) { }
                DrawTransform(xf) { }
            };
            exports_1("b2Draw", b2Draw);
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYjJEcmF3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYjJEcmF3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBZ0JFOzs7Ozs7OztZQUlGLDREQUE0RDtZQUM1RCxVQUFBO2dCQVVFLFlBQVksS0FBYSxHQUFHLEVBQUUsS0FBYSxHQUFHLEVBQUUsS0FBYSxHQUFHLEVBQUUsS0FBYSxHQUFHO29CQUNoRixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDWixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDWixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDWixJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDZCxDQUFDO2dCQUVNLEtBQUs7b0JBQ1YsT0FBTyxJQUFJLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbEMsQ0FBQztnQkFFTSxJQUFJLENBQUMsS0FBYztvQkFDeEIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNqQixJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2pCLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDakIsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNqQixPQUFPLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUVNLE9BQU8sQ0FBQyxLQUFjO29CQUMzQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RHLENBQUM7Z0JBRU0sTUFBTTtvQkFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztnQkFDOUUsQ0FBQztnQkFFTSxRQUFRLENBQUMsR0FBWTtvQkFDMUIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDZixPQUFPLEdBQUcsQ0FBQztnQkFDYixDQUFDO2dCQUVNLFFBQVEsQ0FBQyxLQUFjO29CQUM1QixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO2dCQUNuQixDQUFDO2dCQUVNLEdBQUcsQ0FBQyxFQUFvQixFQUFFLEVBQVcsRUFBRSxFQUFXLEVBQUUsS0FBYSxHQUFHO29CQUN6RSxJQUFJLEVBQUUsWUFBWSxPQUFPLEVBQUU7d0JBQ3pCLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7cUJBQ2Y7eUJBQU07d0JBQ0wsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztxQkFDOUI7Z0JBQ0gsQ0FBQztnQkFFTSxVQUFVLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO29CQUMvQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDbEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO29CQUNsQixPQUFPLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUVNLFdBQVcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTO29CQUMzRCxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDbEIsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDO29CQUNsQixJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7b0JBQ2xCLE9BQU8sSUFBSSxDQUFDO2dCQUNkLENBQUM7Z0JBRU0sTUFBTSxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVTtvQkFDOUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ1osSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ1osSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ1osT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFFTSxPQUFPLENBQUMsRUFBVSxFQUFFLEVBQVUsRUFBRSxFQUFVLEVBQUUsRUFBVTtvQkFDM0QsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ1osSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ1osSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ1osSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQ1osT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFFTSxPQUFPLENBQUMsS0FBYztvQkFDM0IsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNsQixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNsQixPQUFPLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUVNLEdBQUcsQ0FBQyxLQUFjLEVBQUUsR0FBWTtvQkFDckMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN6QixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDekIsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLE9BQU8sR0FBRyxDQUFDO2dCQUNiLENBQUM7Z0JBRU0sT0FBTyxDQUFDLEtBQWM7b0JBQzNCLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDbEIsSUFBSSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNsQixJQUFJLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDbEIsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFFTSxHQUFHLENBQUMsS0FBYyxFQUFFLEdBQVk7b0JBQ3JDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN6QixHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDekIsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3pCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUN6QixPQUFPLEdBQUcsQ0FBQztnQkFDYixDQUFDO2dCQUVNLFdBQVcsQ0FBQyxDQUFTO29CQUMxQixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDWixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDWixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDWixJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDWixPQUFPLElBQUksQ0FBQztnQkFDZCxDQUFDO2dCQUVNLE9BQU8sQ0FBQyxDQUFTLEVBQUUsR0FBWTtvQkFDcEMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkIsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkIsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkIsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztvQkFDbkIsT0FBTyxJQUFJLENBQUM7Z0JBQ2QsQ0FBQztnQkFFTSxHQUFHLENBQUMsUUFBaUIsRUFBRSxRQUFnQjtvQkFDNUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2dCQUVNLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBZSxFQUFFLE1BQWUsRUFBRSxRQUFnQjtvQkFDeEUsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlDLE1BQU0sRUFBRSxHQUFHLENBQUMsUUFBUSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDOUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM5QyxNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDZixNQUFNLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDakIsQ0FBQztnQkFFTSxlQUFlLENBQUMsUUFBZ0IsSUFBSSxDQUFDLENBQUM7b0JBQzNDLE9BQU8sT0FBTyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztnQkFDaEUsQ0FBQztnQkFFTSxNQUFNLENBQUMsZUFBZSxDQUFDLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxFQUFFLElBQVksR0FBRztvQkFDNUUsOEZBQThGO29CQUM5RixDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsd0JBQXdCO29CQUNsQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsd0JBQXdCO29CQUNsQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsd0JBQXdCO29CQUNsQyxzQkFBc0I7b0JBQ3RCLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRTt3QkFDVCxPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7cUJBQ3BDO3lCQUFNO3dCQUNMLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO3FCQUM5QjtnQkFDSCxDQUFDO2FBQ0YsQ0FBQTtZQXRLZSxXQUFHLEdBQVksSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNwQyxhQUFLLEdBQVksSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0QyxZQUFJLEdBQVksSUFBSSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7WUFzS3JELFdBQVksV0FBVztnQkFDckIsaURBQVUsQ0FBQTtnQkFDVix5REFBbUIsQ0FBQTtnQkFDbkIseURBQW1CLENBQUE7Z0JBQ25CLHVEQUFrQixDQUFBO2dCQUNsQix1REFBa0IsQ0FBQTtnQkFDbEIsd0VBQTBCLENBQUE7Z0JBQzFCLHlCQUF5QjtnQkFDekIsZ0VBQXNCLENBQUE7Z0JBQ3RCLFNBQVM7Z0JBQ1Qsb0VBQXdCLENBQUE7Z0JBQ3hCLGdEQUFjLENBQUE7WUFDaEIsQ0FBQyxFQVpXLFdBQVcsS0FBWCxXQUFXLFFBWXRCOztZQUVELHdGQUF3RjtZQUN4RiwwQkFBMEI7WUFDMUIsU0FBQTtnQkFBQTtvQkFDUyxnQkFBVyxHQUFnQixDQUFDLENBQUM7Z0JBcUN0QyxDQUFDO2dCQW5DUSxRQUFRLENBQUMsS0FBa0I7b0JBQ2hDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO2dCQUMzQixDQUFDO2dCQUVNLFFBQVE7b0JBQ2IsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO2dCQUMxQixDQUFDO2dCQUVNLFdBQVcsQ0FBQyxLQUFrQjtvQkFDbkMsSUFBSSxDQUFDLFdBQVcsSUFBSSxLQUFLLENBQUM7Z0JBQzVCLENBQUM7Z0JBRU0sVUFBVSxDQUFDLEtBQWtCO29CQUNsQyxJQUFJLENBQUMsV0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDO2dCQUM3QixDQUFDO2dCQUVNLGFBQWEsQ0FBQyxFQUFlLElBQVMsQ0FBQztnQkFFdkMsWUFBWSxDQUFDLEVBQWUsSUFBUyxDQUFDO2dCQUV0QyxXQUFXLENBQUMsUUFBa0IsRUFBRSxXQUFtQixFQUFFLEtBQWMsSUFBUyxDQUFDO2dCQUU3RSxnQkFBZ0IsQ0FBQyxRQUFrQixFQUFFLFdBQW1CLEVBQUUsS0FBYyxJQUFTLENBQUM7Z0JBRWxGLFVBQVUsQ0FBQyxNQUFjLEVBQUUsTUFBYyxFQUFFLEtBQWMsSUFBUyxDQUFDO2dCQUVuRSxlQUFlLENBQUMsTUFBYyxFQUFFLE1BQWMsRUFBRSxJQUFZLEVBQUUsS0FBYyxJQUFTLENBQUM7Z0JBRTdGLHlCQUF5QjtnQkFDbEIsYUFBYSxDQUFDLE9BQWlCLEVBQUUsTUFBYyxFQUFFLE1BQWlCLEVBQUUsS0FBYSxJQUFTLENBQUM7Z0JBQ2xHLFNBQVM7Z0JBRUYsV0FBVyxDQUFDLEVBQVUsRUFBRSxFQUFVLEVBQUUsS0FBYyxJQUFTLENBQUM7Z0JBRTVELGFBQWEsQ0FBQyxFQUFlLElBQVMsQ0FBQzthQUMvQyxDQUFBIn0=