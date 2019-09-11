import { Injectable } from '@nestjs/common';
const archiver = require('archiver');
const copyfiles = require('copyfiles');
const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
const sharp = require('sharp');
const webfontsGenerator = require('webfonts-generator');

@Injectable()
export class ApiService {
  async copySvgs(icons, dest) {
    return new Promise((resolve, reject) => {
      copyfiles([...icons, dest], true, () => {
        console.log('Files copied');
        resolve('Files copied');
      });
    });
  }

  createArchive(output: any, directoryPath: string) {
    var archive = archiver('zip', {
      zlib: { level: 9 }
    });

    archive.on('warning', function(err: any) {
      if (err.code === 'ENOENT') {
        console.log('Archive creation warning : ', err.code);
      } else {
        throw err;
      }
    });

    archive.on('error', function(err: any) {
      throw err;
    });

    archive.pipe(output);
    archive.directory(directoryPath, false);
    archive.finalize();
  };

  createDirectory(paths: Array<string>) {
    paths.forEach(path => {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
    });
  };

  async createPngs(icons, source, dest, size = 200) {
    for (let index = 0; index < icons.length; index++) {
      const iconSvg = `${icons[index]}.svg`;
      const iconPng = `${icons[index]}.png`;

      await sharp(path.join(source, iconSvg))
        .resize({
          width: size,
          height: size,
          fit: sharp.fit.cover,
        })
        .png()
        .toFile(path.join(dest, iconPng));
    }

    return;
  };

  async createWebfont(files: Array<string>, dest: string) {
    return new Promise((resolve, reject) => {
      webfontsGenerator({
        files,
        dest,
      }, (error: any) => {
        if (error) {
          reject(`Webfonts generation error : ${error}`);
        } else {
          resolve('Webfonts generation success.')
        }
      });
    });
  };

  async replaceColor(icons, source, dest, color) {
    const iconsSrc = icons.map(name => path.join(source, `${name}.svg`));
    const iconsOutput = icons.map(name => path.join(dest, `${name}.svg`));

    return new Promise((resolve, reject) => {
      copyfiles([...iconsSrc, dest], true, () => {
        replace({
          files: iconsOutput,
          from: /fill="#0088ce"/g,
          to: `fill="${color}"`,
        })
          .then(results => {
            resolve('Replacement success.')
          })
          .catch(error => {
            reject(`Error occurred: ${error}`);
          });
      });
    });
  }

  async resizeSvgs(icons, size) {
    try {
      const results = await replace({
        files: icons,
        from: /<svg/g,
        to: `<svg width="${size}" height="${size}"`,
      });
      console.log('Replacement results:', results);
    }
    catch (error) {
      console.error('Error occurred:', error);
    }
  }
}
