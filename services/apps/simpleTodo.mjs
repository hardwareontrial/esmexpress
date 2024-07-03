import db from '@services/orm/index.mjs'
import { Op } from 'sequelize'

const DBBAppUser = db.DatabaseA.models.AppUser;
const DBBSimpleTodo = db.DatabaseA.models.SimpleTodo;

class SimpleTodoServices {
  constructor() {}

  async getAllData(authUserId) {}
  async getDataByQuery(payload, authUserId) { // payload: {query: req.query}
    try {
      const userIsAdmin =  await DBBAppUser.findOne({where: {user_id: authUserId}}).then(result => {return result.is_admin});
      const { filter, tag, search } = payload.query;
      let important, completed, deleted;
      let conditionWhere = {};

      if(filter == 'important'){
        important = [1];
        completed = [0,1];
        deleted = [0,1];
      }else if(filter === 'completed'){
        important = [0,1];
        completed = [1];
        deleted = [0,1];
      }else if(filter === 'deleted'){
        important = [0,1];
        completed = [0,1];
        deleted = [1];
      }else{
        completed = [0];
        deleted = [0];
        important = [0,1];
      }

      if(search){
        conditionWhere = {
          [Op.and]: [
            {isComplete: {[Op.in]: completed}},
            {isDeleted: {[Op.in]: deleted}},
            {isImportant: {[Op.in]: important}},
            {
              [Op.or]: [
                {title: {[Op.like]: `%${search}%`}},
                {detail: {[Op.like]: `%${search}%`}},
                {'$requestorname.fname$': {[Op.like]: `%${search}%`}},
                {'$assigneename.fname$': {[Op.like]: `%${search}%`}},
              ]
            }
          ]
        }
      }else{
        conditionWhere = {
          [Op.and]: [
            {isComplete: {[Op.in]: completed}},
            {isDeleted: {[Op.in]: deleted}},
            {isImportant: {[Op.in]: important}},
          ]
        }
      }
      
      const data = await DBBSimpleTodo.findAll({
        order: [['dueDate', 'asc']],
        include: [
          {model: DBBAppUser, as: 'requestorname'},
          {model: DBBAppUser, as: 'assigneename'},
        ],
        where: conditionWhere,
      })

      return data
    } catch (error) {
      throw error
    }
  };
  
  async createData(payload, authUserId) { // payload: {body:req.body}
    let createDataTrx;
    try {
      createDataTrx = await db.DatabaseA.transaction();

      const {title, duedate, detail, assignee, tags, requestor, isComplete, isImportant, isDeleted} = payload.body;
      const creating = await DBBSimpleTodo.create({
        title: title.toUpperCase(),
        dueDate: duedate,
        detail: detail,
        assignee_id: assignee,
        tags: tags,
        requestor_id: requestor,
        isComplete: isComplete,
        isImportant: isImportant,
        isDeleted: isDeleted,
        creator_user_id: authUserId,
      },{ transaction: createDataTrx })

      await createDataTrx.commit()
      return creating
    } catch (error) {
      if(createDataTrx) { createDataTrx.rollback() }
      throw error
    }
  };

  async updateData(payload, authUserId) { // payload: {id: req.params.id, body:req.body, keyword: ''}
    let updateDataTrx;
    try {
      updateDataTrx = await db.DatabaseA.transaction();
      
      const {title, duedate, detail, assignee, tags, requestor, isComplete, isImportant, isDeleted} = payload.body;
      const detailData = await this.detailData({id: payload.id}, authUserId);

      const updating = await detailData.update({
        title: title.toUpperCase(),
        dueDate: duedate,
        detail: detail,
        assignee_id: assignee,
        tags: tags,
        requestor_id: requestor,
        isComplete: isComplete,
        isImportant: isImportant,
        isDeleted: isDeleted,
      },{ transaction: updateDataTrx })

      await updateDataTrx.commit()
      return updating
    } catch (error) {
      if(updateDataTrx) { updateDataTrx.rollback() }
      throw error
    }
  };

  async detailData(payload, authUserId) { // payload: {id: req.params.id}
    try {
      const detail = await DBBSimpleTodo.findOne({
        where: {id: payload.id},
      })
      return detail
    } catch (error) {
      throw error
    }
  };
}

export default new SimpleTodoServices()