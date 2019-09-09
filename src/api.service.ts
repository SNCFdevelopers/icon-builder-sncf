import { Injectable } from '@nestjs/common';
const archiver = require('archiver');
const fs = require('fs');
const webfontsGenerator = require('webfonts-generator');

@Injectable()
export class ApiService {
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

  generateWebfont(files: Array<string>, dest: string) {
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
}
