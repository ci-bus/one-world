import { Block } from "./interfaces/block";
import { logError, logInfo } from "./libraries/utilities";
import hash from './libraries/hash';
import fs from 'fs';

console.log(`Temp tests performance...`);

const sqlite3 = require('sqlite3').verbose();

const fechaActual = new Date();
const year = fechaActual.getUTCFullYear();
const month = fechaActual.getUTCMonth() + 1;
const dbFile = `src/db/data/${year}_${month}.db`;

const createBlocks = (db: any) => {
  if (db) {
    const statement = db.prepare('INSERT INTO blocks VALUES (?, ?, ?, ?, ?)');
    logInfo(`Creando 1,000,000 bloques`);
    let inicio = performance.now();
    let blocks: Block[] = [];
    // Creando bloques aleatorios
    for (let i = 0; i < 1000000; i++) {
      let block: Block = {
        timestamp: Date.now(),
        previousHash: i ? blocks[i - 1].hash : hash('one-world-genesis'),
        hash: '',
        data: '',
        seals: []
      };
      block.hash = hash(block);
      blocks.push(block);
      statement.run(block.timestamp, block.previousHash, block.hash, block.data, JSON.stringify(block.seals));
      if (i % 100000 === 0) {
        console.log('.');
      }
    }
    statement.finalize();
    let fin = performance.now();
    let duracion = fin - inicio;
    logInfo(`Duracion ${duracion / 1000} segundos`);
    consultarBlocks(db);
  } else {
    logError(`La base de datos no se iniciado`);
  }
}

const consultarBlocks = (db: any) => {
  logInfo(`Consultando 1,000,000 bloques`);
  let inicio = performance.now();
  db.all('SELECT timestamp, previousHash, hash, data, seals FROM blocks', (err: Error, rows: Block[]) => {
    if (err) {
      console.error(err.message);
      return;
    }
    /*
    rows.forEach((row: Block) => {
      console.log(row.timestamp, row.previousHash);
    });
    */
    let fin = performance.now();
    let duracion = fin - inicio;
    logInfo(`Duracion SQL ${duracion / 1000} segundos`);
    pruebaJSON(rows);
  });
};

const pruebaJSON = (blocks: any) => {
  const archivo = 'src/db/test.json';
  fs.unlink(archivo, () => {
    let inicio = performance.now();
    const blocksText = JSON.stringify(blocks);
    fs.writeFile(archivo, blocksText, (err) => {
      if (err) {
        console.error('Error al guardar el archivo:', err);
      } else {
        console.log(`Texto guardado en '${archivo}' con éxito.`);
        let fin = performance.now();
        let duracion = fin - inicio;
        logInfo(`Duracion JSON 1 ${duracion / 1000} segundos`);
        inicio = performance.now();
        fs.readFile(archivo, 'utf8', (err, data) => {
          if (err) {
            console.error('Error al leer el archivo:', err);
          } else {
            const blocksObj = JSON.parse(data);
            fin = performance.now();
            duracion = fin - inicio;
            logInfo(`Duracion JSON 2 ${duracion / 1000} segundos`);
          }
        });
      }
    });
  });
}

fs.access(dbFile, fs.constants.F_OK, (err) => {
  if (err) {
    fs.writeFile(dbFile, '', (err) => {
      if (err) {
        console.error('Error al crear el dbFile:', err);
      } else {
        console.log(`Archivo '${dbFile}' creado con éxito.`);
        const db = new sqlite3.Database(dbFile);
        db.run('CREATE TABLE blocks (timestamp INT, previousHash TEXT, hash TEXT, data TEXT, seals TEXT)', () => {
          createBlocks(db);
        });
      }
    });
  } else {
    console.log(`El dbFile '${dbFile}' ya existe.`);
    const db = new sqlite3.Database(dbFile);
    consultarBlocks(db);
  }
});



