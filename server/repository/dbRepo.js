import {User} from "../models/User.js"
import {Task} from "../models/Task.js"
import {dbUtils} from "../models/dbUtils.js"

class dbRepo {
  constructor() {}

  //------------ User ------------
  createUser(userObj) {
    return dbUtils.createOne(User, userObj);
  }

  findUserByID(auth_id) {
    return dbUtils.findOne(User, auth_id);
  }

  updateUserByID(auth_id, update) {
    return dbUtils.updateOne(User, auth_id, update);
  }

  deleteUserByID(auth_id) {
    return dbUtils.deleteOne(User, auth_id);
  }

  //------------ Task ------------
  createTask(taskObj) {
    return dbUtils.createOne(Task, taskObj);
  }

  findTaskByID(_id) {
    return dbUtils.findOne(Task, _id);
  }

  updateTaskByID(_id, update) {
    return dbUtils.updateOne(Task, _id, update);
  }

  deleteTaskByID(_id) {
    return dbUtils.deleteOne(Task, _id);
  }

  //------------ Subtask ------------
  createSubtask(subtaskObj) {
    return dbUtils.createOne(Subtask, subtaskObj);
  }

  findSubtaskByID(_id) {
    return dbUtils.findOne(Subtask, _id);
  }

  updateSubtaskByID(_id, update) {
      return dbUtils.updateOne(Subtask, _id, update);
  }

  deleteSubtaskByID(_id) {
      return dbUtils.deleteOne(SubTask, _id);
  }
}

export var DBRepo;

export const initDBRepo = () => {
  DBRepo = new dbRepo()
}