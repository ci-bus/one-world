import * as fs from 'fs/promises';
import path from 'path';
import { logError } from '../libraries/utilities';

export default class DataHelper {
  private data: any;
  private file: string;

  constructor(
    name: string,
    data: any = undefined
  ) {
    this.file = path.join(__dirname, `${name}.json`);
    if (data !== undefined) {
      this.data = data;
    } else {
      this.loadStoredData();
    }
  }

  async setAllData(values: any, noStoreData?: boolean) {
    this.data = values;
    if (!noStoreData) {
      return await this.storeData();
    }
  }

  async setData(key: string, value: any, noStoreData?: boolean) {
    this.data[key] = value;
    if (!noStoreData) {
      return await this.storeData();
    }
  }

  async pushData(value: any, noStoreData?: boolean) {
    if (!this.data) {
      this.data = [];
    }
    if (this.data instanceof Array) {
      this.data.push(value);
      if (!noStoreData) {
        return await this.storeData();
      }
    } else {
      logError(`Type of file ${this.file} is not Array.`);
    }
  }

  async updateOrPushData(value: any, keyCompare: string | string[], noStoreData?: boolean) {
    if (!this.data) {
      return await this.pushData(value, noStoreData);
    }
    if (this.data instanceof Array) {
      let index = -1;
      if (Array.isArray(keyCompare)) {
        index = this.data.findIndex((item: any) => keyCompare.reduce((previous: any, current: string) => {
          if (previous) {
            previous = Boolean(item[current] == value[current]);
          }
        }, true));
      } else {
        index = this.data.findIndex((item: any) => item[keyCompare] === value[keyCompare]);
      }
      console.log('index', index);
      if (index !== -1) {
        this.data[index] = {
          ...this.data[index],
          ...value
        };
      } else {
        return await this.pushData(value, noStoreData);
      }
    } else {
      logError(`Type of file ${this.file} is not Array.`);
    }
  }

  getData(key?: string) {
    return key ? this.data[key] : this.data;
  }

  async storeData() {
    try {
      return await fs.writeFile(this.file, JSON.stringify(this.data));
    } catch (error) {
      logError(`Writing ${this.file} file, ${error}`);
    }
  }

  async loadStoredData() {
    try {
      await fs.access(this.file, fs.constants.F_OK);
      this.data = JSON.parse(await fs.readFile(this.file, 'utf8'));
    } catch (error) {
      await this.storeData();
    }
    return this.data;
  }
}