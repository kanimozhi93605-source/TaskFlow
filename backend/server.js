const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// ===============================
// MONGODB CONNECTION
// ===============================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        console.error("MongoDB Connection Error:", error);
    });


// ===============================
// TASK SCHEMA
// ===============================

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },

    priority: {
        type: String,
        default: "Medium"
    },

    date: {
        type: String,
        default: ""
    },

    completed: {
        type: Boolean,
        default: false
    }
});

const Task = mongoose.model("Task", taskSchema);


// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
    res.send("To-Do Backend is Running!");
});


// ===============================
// ADD TASK
// ===============================

app.post("/tasks", async (req, res) => {

    try {

        const newTask = new Task({
            title: req.body.title,
            priority: req.body.priority,
            date: req.body.date,
            completed: req.body.completed || false
        });

        const savedTask = await newTask.save();

        console.log("Task Saved:", savedTask);

        res.status(201).json({
            message: "Task saved successfully!",
            task: savedTask
        });

    } catch (error) {

        console.error("Error saving task:", error);

        res.status(500).json({
            message: "Failed to save task",
            error: error.message
        });

    }

});


// ===============================
// GET ALL TASKS
// ===============================

app.get("/tasks", async (req, res) => {

    try {

        const tasks = await Task.find().sort({ _id: -1 });

        res.json(tasks);

    } catch (error) {

        console.error("Error fetching tasks:", error);

        res.status(500).json({
            message: "Failed to get tasks",
            error: error.message
        });

    }

});


// ===============================
// UPDATE TASK
// ===============================

app.put("/tasks/:id", async (req, res) => {

    try {

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title: req.body.title,
                priority: req.body.priority,
                date: req.body.date,
                completed: req.body.completed
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedTask) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.json(updatedTask);

    } catch (error) {

        console.error("Update error:", error);

        res.status(500).json({
            message: "Failed to update task",
            error: error.message
        });

    }

});


// ===============================
// DELETE TASK
// ===============================

app.delete("/tasks/:id", async (req, res) => {

    try {

        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {

            return res.status(404).json({
                message: "Task not found"
            });

        }

        res.json({
            message: "Task deleted successfully!"
        });

    } catch (error) {

        console.error("Delete error:", error);

        res.status(500).json({
            message: "Failed to delete task",
            error: error.message
        });

    }

});


// ===============================
// DELETE ALL COMPLETED TASKS
// ===============================

app.delete("/tasks/completed/all", async (req, res) => {

    try {

        await Task.deleteMany({
            completed: true
        });

        res.json({
            message: "Completed tasks deleted successfully!"
        });

    } catch (error) {

        console.error("Clear completed error:", error);

        res.status(500).json({
            message: "Failed to clear completed tasks",
            error: error.message
        });

    }

});


// ===============================
// START SERVER
// ===============================

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});