import { BaseTask, TaskObj } from "./TaskObj.js"
import { getService } from "../services/service.js"
import { ObjArrayCopy } from "../common/ObjArrayCopy.js";
import { store } from "../redux/store.js";
import { taskActions } from "../redux/Tasks/taskActions.js"

let taskList = null

export function initTaskList(user_id = null) {
    taskList = new TaskList(user_id);
}

export function getTaskList() {
    if(taskList == null) {
        initTaskList()
    }

    return taskList
}

class TaskList {
 constructor(user_id) {
    this.user_id = user_id;
    this.next_order = 0
    this.setTaskListState();
  }

  async setTaskListState() {
    const task = await getService().localService.user.getTasks(this.user_id);

    const taskObjs = dbTasksToTaskObjs(task.data);
    taskObjs.sort((a, b) => a.order - b.order)
    
    taskActions.setTasks(taskObjs);
    this.next_order = taskObjs.length;
  }

  async addTask() { 
    const res = await getService().localService.task.create(
      new BaseTask({ user_id: this.user_id, order: this.next_order })
    );

    this.next_order++;

    const newTaskObj = new TaskObj(res.data);
    taskActions.addTask(newTaskObj);
  }

  async updateTask(index, updateObj) {
    const tasks = ObjArrayCopy(store.getState().tasks);
    const task = tasks[index];

    Object.keys(updateObj).forEach((attrKey) => {
      task[attrKey] = updateObj[attrKey];
    });
    
    taskActions.setTasks(tasks);

    updateObj.task_id = task._id;
    await getService().localService.task.update(updateObj);
  }

  async deleteTask(index) {
    const tasks = ObjArrayCopy(store.getState().tasks)

    const removedTask = tasks.splice(index, 1)[0]
    
    await getService().localService.task.delete(removedTask._id)

    tasks.forEach( async (task, index) => {
        if(task.order !== index) {
            task.order = index

            await getService().localService.task.update({
                task_id: task._id,
                order: index,
            });
        }
    })

    taskActions.setTasks(tasks);
  }

  async updatePomodoroProgress(index) {
    const tasks = ObjArrayCopy(store.getState().tasks)
    const updateObj = {task_id: tasks[index]._id}

    let new_pomodoro_progress = tasks[index].pomodoro_progress + (1/ tasks[index].pomodoro_duration * 100.0)

    if(new_pomodoro_progress >= 100) {
        new_pomodoro_progress = 100      
    }

    tasks[index].pomodoro_progress = new_pomodoro_progress;
    updateObj.pomodoro_progress = new_pomodoro_progress

    taskActions.setTasks(tasks);
    
    await getService().localService.task.update(updateObj)
  }

  async updateTaskOrder(source_index, destination_index) {
      let tasks = ObjArrayCopy(store.getState().tasks);
      const updateObj = {
          task_id : tasks[source_index]._id,
          order : destination_index
      }

      tasks = swapContent(tasks, source_index, destination_index);
      taskActions.setTasks(tasks);
      
      await getService().localService.task.update(updateObj)
  }
}

function dbTasksToTaskObjs(dbTasks) {
    const taskObjs = []

    dbTasks.forEach(dbTask => {
        taskObjs.push(new TaskObj(dbTask))
    })

    return taskObjs
}

function swapContent(content, source_index, destination_index) {
  const newContent = ObjArrayCopy(content);
  const removedItem = { ...content[source_index] };

  newContent.splice(source_index, 1);
  newContent.splice(destination_index, 0, removedItem);

  newContent.forEach((item, index) => {
      item.lastEdit = new Date().getTime()
      item.order = index
    });

  return newContent;
}