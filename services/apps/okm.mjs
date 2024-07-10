import db from '@services/orm/index.mjs'
import { Op, where } from 'sequelize'
import path from 'path'
import fs from 'fs'

const OKMMaterialModel = db.DatabaseA.models.OKMMaterial;
const OKMMaterialContent = db.DatabaseA.models.OKMMaterialContent;
const AppUserModel = db.DatabaseA.models.AppUser;
const AppDeptModel = db.DatabaseA.models.AppHrDepartment;

class OKMServices {
  constructor() {
    this.materialStorage = path.join(path.resolve(), '/public/storage/app/okm/material/');
  }

  /** Material Section */
  async getAllMaterials() {
    try {
      const materials = await OKMMaterialModel.findAll({
        include: [
          {model: OKMMaterialContent, as: 'materialContents'},
          {model: AppDeptModel, as: 'materialDeptOKM'}
        ],
      });
      return materials
    } catch (error) {
      throw error
    }
  };

  async getAllMaterialsPaginate() {};

  async createMaterial(payload, authUserId) {
    let materialCreateTrx;
    try {
      const { title, sinopsis, level, deptId } = payload.body;
      const isActive = payload.body.isActive;
      const authUser = await this.getUser(authUserId);
      const materialFile = payload.file;

      materialCreateTrx = await db.DatabaseA.transaction();
      const newMaterial = await OKMMaterialModel.create({
        title: title.upperCase(),
        sinopsis: sinopsis,
        level: level,
        department_id: deptId,
        is_active: isActive,
        created_by: authUser?.fname
      }, { transaction: materialCreateTrx });
      await materialCreateTrx.commit();

      if(materialFile) {
        payload.material_id = newMaterial.id;
        const storingMaterialContent = await this.createMaterialContent(payload, authUserId)
      }

      return newMaterial
    } catch (error) {
      if(materialCreateTrx) { await materialCreateTrx.rollback(); }
      throw error
    }
  };

  async createMaterialContent(payload, authUserId) {
    let materialContentCreate, filenameWithExt, filePath;
    try {
      const { material_id, description } = payload.body;
      const materialFile = payload.file;
      const authUser = await this.getUser(authUserId);

      const filename = await this.createDateName('materialContent');
      filenameWithExt = `${filename}.${materialFile.mimetype.split('/')[1]}`;
      filePath = path.join(this.materialStorage, filenameWithExt);
      await this.storeMaterialContentFile(materialFile, filePath);

      materialContentCreate = await db.DatabaseA.transaction();
      const newMaterialContent = await OKMMaterialModel.create({
        material_id: material_id,
        description: description,
        filepath: filePath,
      }, { transaction: materialContentCreate });
      await materialContentCreate.commit();

      return newMaterialContent;
    } catch (error) {
      if(materialContentCreate) {
        fs.unlinkSync(filePath)
        await materialContentCreate.rollback();
      }
      throw error;
    }
  };

  async editMaterial() {}
  async editMaterialContent() {}
  async detailMaterial() {}
  async detailMaterialContent() {}
  async deleteMaterial() {}
  async deleteMaterialContent() {};

  async storeMaterialContentFile(file, filePath) {
    try {
      fs.mkdirSync(path.dirname(filePath),{ recursive: true });
      fs.writeFileSync(filePath, file.buffer);
      return filePath
    } catch (error) {
      throw error
    }
  };

  /** Misc */
  async getUser(id) {
    try {
      const user = await AppUserModel.find({
        where: {user_id: id},
      });
      if(!user) { return null }
      return user
    } catch (error) {
      throw error
    }
  };

  async createDateName(type) {
    try {
      const currentTimeInMilliseconds = Date.now();
      const currentTimeInSecond = Math.floor(currentTimeInMilliseconds/1000)
      const result = `${type}_${currentTimeInSecond}`
      return result
    } catch (e) {
      return e
    }
  };
}

export default new OKMServices()