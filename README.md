# Cryptanalysis Toolkit

Web-based tools for breaking ciphers and analyzing encrypted text. Made for CTF competitions and cryptography practice.

## Tools

- **Cipher Tool** - Auto-detect and decrypt common ciphers (Caesar, Base64, Morse, etc)
- **Vigenere Cracker** - Dictionary attack and brute force
- **Beaufort Cracker** - Dictionary attack for Beaufort cipher
- **Hexahue Decoder** - Decode color-based cipher
- **IoC Analyzer** - Find key lengths using Index of Coincidence
- **Word Finder** - Find valid words from letter combinations
- **Keyboard Heatmap** - Visualize letter frequency on different layouts
- **Punycode Decoder** - Decode internationalized domain names

## Setup

Everything runs in the browser, no installation needed.

To host on GitHub Pages:

1. Create a new repo
2. Upload index.html and script.js
3. Go to Settings > Pages
4. Select main branch as source
5. Site will be at https://yourusername.github.io/repo-name

Or use git:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/yourusername/repo-name.git
git push -u origin main
```

Then enable GitHub Pages in settings.

## Notes

- Dictionary attacks need internet connection (loads wordlist once)
- Everything runs client-side, your data stays in your browser
- Brute force with key length over 4 can be slow
- IoC analyzer creates a graph to visualize likely key lengths

## License

Free to use for educational purposes and CTFs.

