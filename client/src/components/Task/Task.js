import React from "react";
import { useSelector } from "react-redux";

import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import Fade from "@material-ui/core/Fade";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import PlayPauseButton from "./PlayPauseButton/PlayPauseButton";
import TaskContext from "./TaskContext/TaskContext";
import TextField from "@material-ui/core/TextField";

import "./Task.modules.scss";
import { getTaskList } from "../../classes/TaskList.js"

const fadeExit = 30;

export default function Task(props) {
    const { index, task, provided, dragging } = props;
    const { checked, subtasksVisible } = task;

    const [optionsVisible, setOptionsVisible] = React.useState(false);
    const [handleVisible, setHandleVisible] = React.useState(false);
    const [temporaryTask, setTemporaryTask] = React.useState({ content: task.content, lastEdit: new Date().getTime() });
    const shiftHeld = React.useRef(false);

    function onCheckboxChange() {
        getTaskList().updateTask(index, { checked: !checked })
    }

    function onContextMenu(e) {
        e.preventDefault();
        document.activeElement.blur();
        // if (subtasksVisible)
        //     return;

        setOptionsVisible(prevState => !prevState);
        setHandleVisible(false);
    }

    React.useEffect(() => {
        if (dragging) {
            setOptionsVisible(false);
        }
    }, [dragging]);

    //Effect when main store content is changed
    React.useEffect(() => {
        setTemporaryTask({ content: task.content, lastEdit: new Date().getTime() });
    }, [task.content])

    const textChange = React.useCallback((e) => {
        setTemporaryTask({ content: e.target.value, lastEdit: new Date().getTime() });
    }, []);

    const onMouseOver = React.useCallback((e) => {
        //Ignore if mouse over target is "div" and "div.MuiPopover-root". Otherwise this callback is triggered when right click context is dismissed
        if(e.target.className === "" || e.target.className === "MuiPopover-root")
            return;

        if (optionsVisible && handleVisible)
            setHandleVisible(false);

        else if (!optionsVisible && !handleVisible)
            setHandleVisible(true);
    }, [optionsVisible, handleVisible]);

    const onMouseLeave = React.useCallback(() => {
        setHandleVisible(false);
    }, []);

    //Save temporary content to original store
    const textFocusOut = React.useCallback(() => {
        shiftHeld.current = false;
        getTaskList().updateTask(index, { content: temporaryTask.content, lastEdit: new Date().getTime() })
    }, [index, temporaryTask]);

    const keyDown = React.useCallback((e) => {
        if (e.key === "Shift")
            shiftHeld.current = true;

        else if (e.key === "Enter") {
            if (!shiftHeld.current)
                document.activeElement.blur();
        }
    }, [shiftHeld]);

    const keyUp = React.useCallback((e) => {
        if (e.key === "Shift")
            shiftHeld.current = false;
    }, [shiftHeld]);

    return (
        <Grid item xs={12} ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="transition-style">
            <Paper
                className={`task-paper ${subtasksVisible ? "selected-task-paper" : "null"}`}
                elevation={0}
                onContextMenu={onContextMenu}
                onMouseOver={onMouseOver}
                onMouseLeave={onMouseLeave}
            >
                <Grid container spacing={0} className={"task-container"} alignItems={"center"} justify="flex-start" id={task}>
                    <Grid item xs={1} className={"task-item"}>
                        <Checkbox color="default" checked={checked} onChange={onCheckboxChange}></Checkbox>
                    </Grid>
                    <Grid item xs={10} className={"text-field-grid-item"}>
                        <Grid container
                            direction="column"
                            justify="space-between"
                            spacing={1}
                        >
                            <Grid item xs={12}>
                                <TextField
                                    classes={{
                                        root: "text-field-root"
                                    }}
                                    InputProps={{
                                        classes: {
                                            root: "outlined-root task-input-outlined-root",
                                            multiline: "outlined-multiline",
                                            disabled: "text-field-disabled",
                                            notchedOutline: "text-field-border",
                                            focused: "text-field-focused"
                                        }
                                    }}
                                    size="small"
                                    margin="none"
                                    fullWidth={true}
                                    multiline={true}
                                    variant={"outlined"}
                                    value={temporaryTask.lastEdit > task.lastEdit ? temporaryTask.content : task.content}
                                    autoComplete="false"
                                    autoCapitalize="false"
                                    onChange={textChange}
                                    onBlur={textFocusOut}
                                    onKeyDown={keyDown}
                                    onKeyUp={keyUp}
                                    placeholder="Enter new task"
                                />

                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={1}>
                        <PlayPauseButton
                            task={task}
                            index={index}
                            dragging={dragging}
                        />
                    </Grid>
                </Grid>
                <TaskContext optionsVisible={optionsVisible} setOptionsVisible={setOptionsVisible} index={index} />
                <div className="drag-handle-div">
                    <Fade in={handleVisible}>
                        <DragHandleIcon
                            fontSize="small"
                            color="disabled"
                            classes={{ root: "drag-handle-root" }}
                        />
                    </Fade>
                </div>
            </Paper>
        </Grid >
    )
}