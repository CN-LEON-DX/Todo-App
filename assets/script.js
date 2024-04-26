// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, child, update, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGytI7I5XsCzP9ro49JsgfapwPVMKqikY",
  authDomain: "todo-app-383c5.firebaseapp.com",
  databaseURL: "https://todo-app-383c5-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "todo-app-383c5",
  storageBucket: "todo-app-383c5.appspot.com",
  messagingSenderId: "223389659137",
  appId: "1:223389659137:web:fd6f72a4c56be4df779000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase();

// THỰC HIỆN CHỨC NĂNG APP TO-DO

// TẠO CÔNG VIỆC 
// Lấy data của form todo
const todoCreate = document.querySelector("#todo-create");
todoCreate.addEventListener("submit", (event) => {
    event.preventDefault(); // Ngăn chặn load lạ trang để lấy data
    // console.log(event);
    const content = event.target.elements.content.value; // Lấy giá trị nếu để name = content thì elements.content
    // Sau đó tạo mới todo
    if (content) {
        set(push(ref(db, 'todos')), {
            content: content,
            completed: false,
        });
        event.target.elements.content.value = ""; // Đưa input về rỗng
    }
});

//---------------------------------------------------------------

// Hoàn thành công việc 
const completeTask = () => {
    const listButtonComplete = document.querySelectorAll("[button-complete]");
    // console.log(listButtonComplete);
    listButtonComplete.forEach(button => {
        button.addEventListener("click" , () => {
            // console.log(button);
            // Quan trọng là lấy id để hoàn thành 
            const id = button.getAttribute("button-complete");
            // console.log(id);
            // Lấy ra id rồi update trạng thái cho id đó:
            update(ref(db, 'todos/' + id), {
                completed: true
            });
            // Không cần cập nhật hết thông tin đâu:
        });
    });
}
const undoTask = () => {
    const listButtonUndo = document.querySelectorAll("[button-undo]");
    // console.log(listButtonComplete);
    listButtonUndo.forEach(button => {
        button.addEventListener("click" , () => {
            // console.log(button);
            // Quan trọng là lấy id để hoàn thành 
            const id = button.getAttribute("button-undo");
            // console.log(id);
            // Lấy ra id rồi update trạng thái cho id đó:
            update(ref(db, 'todos/' + id), {
                completed: false
            });
            // Không cần cập nhật hết thông tin đâu:
        });
    });
}
const editTask = () => {
    const listButtonEdit = document.querySelectorAll("[button-edit]");
    let editStates = {};
    // console.log(listButtonEdit);
    listButtonEdit.forEach(button => {
        button.addEventListener("click" , () => {
            // console.log(button);
            // Quan trọng là lấy id để hoàn thành 
            const id = button.getAttribute("button-edit");
            const parent = button.closest(".todo-app__item");
            const taskContent = parent.querySelector(".todo-app__item-content");
            const inputTask = parent.querySelector("input");

            // EditState như là một cái hash lưu trạng thái 
            // Nếu chửa tồn tại hay undefine -> !flase || false = true; tức là toggle sang giá trị KHÁC
            editStates[id] = !editStates[id] || false; 
            
            // Ẩn phần tử hiện tại chứa nội dung công việc và hiển thị ô input
            taskContent.style.display = editStates[id] ? "none" : "inline-block";
            inputTask.classList.toggle("todo-input__edit__display", editStates[id]);

            const editButton = button.querySelector("#edit");
            const checkButton = button.querySelector("#submit");
            editButton.style.display = editStates[id] ? "none" : "inline-block";
            checkButton.style.display = editStates[id] ? "inline-block" : "none";

            if (editStates[id]) {
                inputTask.value = taskContent.textContent.trim();
            }else {
                console.log("Running");
                // Nếu xác nhận đưa vào rồi thì update lên csdl\
                update(ref(db, 'todos/' + id), {
                    content: inputTask.value
                });
            }
            // Nếu nhấn vào thì icon edit thành dấu ok 

        });
    });
}

const deleteTask = () => {
    const listButtonDelete = document.querySelectorAll("[button-delete]");
    // console.log(listButtonDelete);
    listButtonDelete.forEach(button => {
        button.addEventListener("click" , () => {
            const id = button.getAttribute("button-delete");
            // Hiện ra thông báo với 2 option là hủy xóa và xác nhận 
            const parent = button.closest(".todo-app__item");
            const taskContent = parent.querySelector(".todo-app__item-content");
            const todoApp = document.querySelector(".todo-app");
            const formDelete = todoApp.querySelector(".todo-app__confirm--delete");
            formDelete.classList.add("todo-app__confirm--delete-display");
            const contentConfirm = formDelete.querySelector(".content");
            contentConfirm.innerText = taskContent.textContent;


            const background = document.querySelector(".background-close");
            background.style.display = "block";
            let removeBackGround = () => {
                formDelete.classList.remove("todo-app__confirm--delete-display");
                background.style.display = "none";
            };
            
            background.addEventListener("click" , () => {
                removeBackGround();
            });

            // Nếu click vào ok thì xóa 
            const confirmButton = formDelete.querySelector(".confirm-yes");
            confirmButton.addEventListener("click", (event) => {
                event.preventDefault(); 
                remove(ref(db, 'todos/' + id));
                removeBackGround();
            });

            const cancelButton = formDelete.querySelector(".confirm-no");
            cancelButton.addEventListener("click", (event) => {
                event.preventDefault(); 
                removeBackGround();
            });
            // Lấy button ra ngăn chặn sự kiện reset lại page
        })
    });
};
// Hiển thị ra giao diện 
    // Onvalue như là load lại web nhưng chỉ cập nhật !
onValue(ref(db, 'todos'), (snapshot) =>{
    let tasks = "";
    
    snapshot.forEach((child) => {
        const childKey = child.key;
        const childData = child.val();
        // Chỉ cần check xem có class complete hay không là ta có thể css thoải mái
        tasks = `
            <div class="todo-app__item ${childData.completed ? "todo-app__item--completed" : ""} ">
                <div class="todo-app__item-content">   ${childData.content} </div>
                <input type="text" class="todo-input__edit" id="input-edit">
                <div class="todo-app__item-actions">
                    <button 
                        class="todo-app__item-button todo-app__item-button--edit"
                        button-edit="${childKey}"
                        >
                        <i class="fa-solid fa-pen-to-square" id="edit"></i>
                        <i class="fa-solid fa-check-double" id="submit"></i>
                    </button>
                    <button 
                        class="todo-app__item-button todo-app__item-button--complete"
                        button-complete="${childKey}">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button 
                        class="todo-app__item-button todo-app__item-button--undo"
                        button-undo="${childKey}">
                        <i class="fa-solid fa-rotate-right"></i>
                    </button>
                    <button class="todo-app__item-button todo-app__item-button--delete"
                        button-delete="${childKey}">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        ` + tasks;
    });
    
    const todoList = document.querySelector("#todo-list");
    todoList.innerHTML = tasks;
    // Vẽ xong data ra ngoài giao diện mới gọi hàm này đảm bảo xử lý skien
    completeTask();
    undoTask();
    editTask();
    deleteTask();
});

// Chỉnh sửa thông tin 
