/* Common utilities (no dependencies) */

function base64UrlEncode(str) {
  // UTF-8 safe base64url encoding with wide browser support (no TextEncoder required)
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(b64url) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((b64url.length + 3) % 4);
  const bin = atob(b64);
  // UTF-8 safe decode (no TextDecoder required)
  return decodeURIComponent(escape(bin));
}


/* LZ-string (MIT) - https://pieroxy.net/blog/pages/lz-string/index.html
   Embedded minimal functions: compressToEncodedURIComponent, decompressFromEncodedURIComponent */
const LZString = (function() {
  const f = String.fromCharCode;
  const keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
  const baseReverseDic = {};

  function getBaseValue(alphabet, character) {
    if (!baseReverseDic[alphabet]) {
      baseReverseDic[alphabet] = {};
      for (let i = 0; i < alphabet.length; i++) baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
    return baseReverseDic[alphabet][character];
  }

  function compress(uncompressed) {
    if (uncompressed == null) return "";
    let i, value;
    const context_dictionary = {};
    const context_dictionaryToCreate = {};
    let context_c = "";
    let context_wc = "";
    let context_w = "";
    let context_enlargeIn = 2; // Compensate for the first entry which should not count
    let context_dictSize = 3;
    let context_numBits = 2;
    const context_data = [];
    let context_data_val = 0;
    let context_data_position = 0;

    for (let ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data.push(f(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 8; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data.push(f(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data.push(f(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 16; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == 15) {
                context_data_position = 0;
                context_data.push(f(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data.push(f(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }

        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }

        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data.push(f(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data.push(f(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data.push(f(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == 15) {
              context_data_position = 0;
              context_data.push(f(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position == 15) {
            context_data_position = 0;
            context_data.push(f(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }
      }

      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    value = 2;
    for (i = 0; i < context_numBits; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position == 15) {
        context_data_position = 0;
        context_data.push(f(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == 15) {
        context_data.push(f(context_data_val));
        break;
      } else context_data_position++;
    }

    return context_data.join("");
  }

  function decompress(compressed) {
    if (compressed == null) return "";
    if (compressed === "") return null;
    const dictionary = [0, 1, 2];
    let enlargeIn = 4;
    let dictSize = 4;
    let numBits = 3;
    let entry = "";
    let result = [];
    let i;
    let w;
    let bits, resb, maxpower, power;
    let c;
    const data = { string: compressed, val: compressed.charCodeAt(0), position: 32768, index: 1 };

    function readBits(n) {
      bits = 0;
      maxpower = Math.pow(2, n);
      power = 1;
      while (power != maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = 32768;
          data.val = data.string.charCodeAt(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      return bits;
    }

    const next = readBits(2);
    switch (next) {
      case 0: c = f(readBits(8)); break;
      case 1: c = f(readBits(16)); break;
      case 2: return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);

    while (true) {
      if (data.index > data.string.length) return "";
      const cc = readBits(numBits);
      let code = cc;
      switch (code) {
        case 0:
          dictionary[dictSize++] = f(readBits(8));
          code = dictSize - 1;
          enlargeIn--;
          break;
        case 1:
          dictionary[dictSize++] = f(readBits(16));
          code = dictSize - 1;
          enlargeIn--;
          break;
        case 2:
          return result.join("");
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[code]) {
        entry = dictionary[code];
      } else {
        if (code === dictSize) entry = w + w.charAt(0);
        else return null;
      }
      result.push(entry);

      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }
    }
  }

  function compressToEncodedURIComponent(input) {
    if (input == null) return "";
    return _compress(input, 6, function(a){ return keyStrUriSafe.charAt(a); });
  }

  function _compress(uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    let i, value;
    const context_dictionary = {};
    const context_dictionaryToCreate = {};
    let context_c = "";
    let context_wc = "";
    let context_w = "";
    let context_enlargeIn = 2;
    let context_dictSize = 3;
    let context_numBits = 2;
    const context_data = [];
    let context_data_val = 0;
    let context_data_position = 0;

    for (let ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }
      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
          if (context_w.charCodeAt(0) < 256) {
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else context_data_position++;
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 8; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else context_data_position++;
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i = 0; i < context_numBits; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else context_data_position++;
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i = 0; i < 16; i++) {
              context_data_val = (context_data_val << 1) | (value & 1);
              if (context_data_position == bitsPerChar - 1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else context_data_position++;
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else context_data_position++;
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
        if (context_w.charCodeAt(0) < 256) {
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else context_data_position++;
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 8; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else context_data_position++;
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i = 0; i < context_numBits; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else context_data_position++;
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i = 0; i < 16; i++) {
            context_data_val = (context_data_val << 1) | (value & 1);
            if (context_data_position == bitsPerChar - 1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else context_data_position++;
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i = 0; i < context_numBits; i++) {
          context_data_val = (context_data_val << 1) | (value & 1);
          if (context_data_position == bitsPerChar - 1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else context_data_position++;
          value = value >> 1;
        }
      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    value = 2;
    for (i = 0; i < context_numBits; i++) {
      context_data_val = (context_data_val << 1) | (value & 1);
      if (context_data_position == bitsPerChar - 1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else context_data_position++;
      value = value >> 1;
    }

    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar - 1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      } else context_data_position++;
    }

    return context_data.join("");
  }

  function decompressFromEncodedURIComponent(input) {
    if (input == null) return "";
    if (input === "") return null;
    input = input.replace(/ /g, "+");
    return _decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  }

  function _decompress(length, resetValue, getNextValue) {
    const dictionary = [0,1,2];
    let next, enlargeIn = 4, dictSize = 4, numBits = 3;
    let entry = "";
    let result = [];
    let i, w, bits, resb, maxpower, power, c;
    const data = { val: getNextValue(0), position: resetValue, index: 1 };

    function readBits(n) {
      bits = 0; maxpower = Math.pow(2,n); power = 1;
      while (power != maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) { data.position = resetValue; data.val = getNextValue(data.index++); }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      return bits;
    }

    next = readBits(2);
    switch (next) {
      case 0: c = f(readBits(8)); break;
      case 1: c = f(readBits(16)); break;
      case 2: return "";
    }
    dictionary[3] = c; w = c; result.push(c);

    while (true) {
      if (data.index > length) return "";
      const cc = readBits(numBits);
      let code = cc;
      switch (code) {
        case 0: dictionary[dictSize++] = f(readBits(8)); code = dictSize - 1; enlargeIn--; break;
        case 1: dictionary[dictSize++] = f(readBits(16)); code = dictSize - 1; enlargeIn--; break;
        case 2: return result.join("");
      }
      if (enlargeIn == 0) { enlargeIn = Math.pow(2, numBits); numBits++; }
      entry = dictionary[code] || (code === dictSize ? w + w.charAt(0) : null);
      if (entry == null) return null;
      result.push(entry);
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;
      w = entry;
      if (enlargeIn == 0) { enlargeIn = Math.pow(2, numBits); numBits++; }
    }
  }

  return { compressToEncodedURIComponent, decompressFromEncodedURIComponent, compress, decompress };
})();



// Payload encoding/decoding
// v2: LZ-compressed JSON using URI-safe alphabet (shorter URLs). Falls back to v1 base64url JSON.

function imgToToken(imgObj) {
  if (!imgObj) return "";
  if (imgObj.type === "builtin" && imgObj.name) return "b:" + imgObj.name;
  if (imgObj.type === "url" && imgObj.url) return "u:" + imgObj.url;
  return "";
}

function tokenToImg(tok) {
  if (!tok) return null;
  if (typeof tok === "object") return tok; // v1 compatibility
  if (typeof tok !== "string") return null;
  if (tok.startsWith("b:")) return { type: "builtin", name: tok.slice(2) };
  if (tok.startsWith("u:")) return { type: "url", url: tok.slice(2) };
  return null;
}

function normalizePayload(p) {
  if (!p || typeof p !== "object") throw new Error("Invalid payload");
  if (p.v >= 2) {
    return {
      v: 2,
      front: tokenToImg(p.f),
      second: tokenToImg(p.s),
      messageHtml: p.m || "",
      icon: p.i || ""
    };
  }
  // v1
  return {
    v: 1,
    front: p.front || null,
    second: p.second || null,
    messageHtml: p.messageHtml || "",
    icon: p.icon || ""
  };
}

function encodeCardPayload(obj) {
  // Expect normalized-ish object with front/second/messageHtml/icon
  const compact = {
    v: 2,
    f: imgToToken(obj.front),
    s: imgToToken(obj.second),
    m: obj.messageHtml || "",
    i: obj.icon || ""
  };
  const json = JSON.stringify(compact);
  // LZ compression yields much shorter URLs for formatted HTML
  return LZString.compressToEncodedURIComponent(json);
}

function decodeCardPayload(token) {
  // Try v2 first
  try {
    const json = LZString.decompressFromEncodedURIComponent(token);
    const parsed = JSON.parse(json);
    return normalizePayload(parsed);
  } catch (e) {
    // Fallback to v1 base64url json
    const parsed = JSON.parse(base64UrlDecode(token));
    return normalizePayload(parsed);
  }
}

function resolveImage(imgObj) {
  if (!imgObj) return null;
  if (imgObj.type === "builtin") return `images/${imgObj.name}`;
  if (imgObj.type === "url") return imgObj.url;
  return null;
}


// Message HTML sanitizer
// Keeps a small, safe subset of formatting tags and the alignment classes:
//   align-left | align-center | align-right | align-justify
// Allows inline color styles from the editor.
function sanitizeMessageHTML(inputHtml) {
  const html = (inputHtml || "").toString();
  // Quick return for empty
  if (!html.trim()) return "";

  const allowedTags = new Set([
    "H1","H2","H3","H4",
    "P","DIV","SPAN","BR",
    "B","STRONG","I","EM","U",
    "UL","OL","LI",
    "BLOCKQUOTE","HR",
    "A"
  ]);

  const allowedAlignClasses = new Set(["align-left","align-center","align-right","align-justify"]);

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;

  function cleanStyle(styleText) {
    if (!styleText) return "";
    // Only keep color-related declarations
    const keep = [];
    const parts = styleText.split(";");
    for (const part of parts) {
      const [rawProp, rawVal] = part.split(":");
      if (!rawProp || !rawVal) continue;
      const prop = rawProp.trim().toLowerCase();
      const val = rawVal.trim();
      if (prop === "color") {
        keep.push(`${prop}:${val}`);
      }
    }
    return keep.join(";");
  }

  function sanitizeNode(node) {
    if (node.nodeType === Node.TEXT_NODE) return;
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.remove();
      return;
    }

    const tag = node.tagName;

    // Drop disallowed elements but keep their text/children
    if (!allowedTags.has(tag)) {
      const parent = node.parentNode;
      while (node.firstChild) parent.insertBefore(node.firstChild, node);
      node.remove();
      return;
    }

    // Strip attributes aggressively; we'll add back a tiny safe subset.
    // This avoids style/layout/script injection via unexpected attributes.
    const origClass = node.getAttribute("class") || "";
    const origStyle = node.getAttribute("style") || "";
    const origHref  = node.getAttribute("href") || "";

    // Remove everything, then add back what we explicitly allow.
    const attrs = Array.from(node.attributes || []);
    for (const a of attrs) node.removeAttribute(a.name);

    // Class: keep only alignment classes
    {
      const classes = origClass
        .split(/\s+/)
        .filter(Boolean)
        .filter(c => allowedAlignClasses.has(c));
      if (classes.length) node.setAttribute("class", classes.join(" "));
    }

    // Style: keep only color
    {
      const cleaned = cleanStyle(origStyle);
      if (cleaned) node.setAttribute("style", cleaned);
    }

    // <font color="..."> can be produced by execCommand in some browsers.
    if (tag === "FONT") {
      // (FONT isn't in allowedTags currently, but just in case)
      node.remove();
      return;
    }

    // Links
    if (tag === "A") {
      const href = (origHref || "").trim();
      const safe = /^https?:\/\//i.test(href) || /^mailto:/i.test(href);
      if (!safe) {
        // Replace link with its text content
        const parent = node.parentNode;
        const text = doc.createTextNode(node.textContent || "");
        parent.insertBefore(text, node);
        node.remove();
        return;
      }
      node.setAttribute("href", href);
      node.setAttribute("target", "_blank");
      node.setAttribute("rel", "noopener noreferrer");
    }

    // Recurse
    const children = Array.from(node.childNodes);
    for (const child of children) sanitizeNode(child);
  }

  // Walk depth-first
  const kids = Array.from(root.childNodes);
  for (const n of kids) sanitizeNode(n);

  // Normalize: ensure we don't leave empty wrapper-only whitespace nodes
  return root.innerHTML;
}




/* Responsive helper */
function isMobile() {
  try {
    return window.matchMedia && window.matchMedia("(max-width: 860px)").matches;
  } catch {
    return false;
  }
}

/* Falling icon overlay (snowflake-inspired) */
function makeFallingIcons(char) {
  const ch = (char || "").trim();
  if (!ch) return;

  // Remove existing layer if any
  const old = document.getElementById("fallLayer");
  if (old) old.remove();

  const layer = document.createElement("div");
  layer.id = "fallLayer";
  layer.className = "fallLayer";
  document.body.appendChild(layer);

  const count = 28; // light enough for mobile
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "fallIcon";
    span.textContent = ch;

    const size = 12 + Math.random() * 26; // px
    const left = Math.random() * 100; // vw
    const dur = 7 + Math.random() * 10; // s
    const delay = -Math.random() * dur; // negative to stagger
    const sway = (Math.random() * 80 - 40); // px

    span.style.left = left + "vw";
    span.style.fontSize = size + "px";
    span.style.animationDuration = dur + "s, " + (3 + Math.random() * 4) + "s";
    span.style.animationDelay = delay + "s, " + (-Math.random() * 4) + "s";
    span.style.setProperty("--sway", sway + "px");

    layer.appendChild(span);
  }
}
