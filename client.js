// client.js

// Get the current user
const user = firebase.auth().currentUser;
if(!user) {
    // Redirect if not logged in
    window.location.href = "auth.html";
}

const uid = user.uid;
const ordersRef = firebase.database().ref('orders/' + uid);
const ordersUl = document.getElementById('ordersUl');

// Function to load and display orders
function loadOrders() {
    ordersRef.on('value', snapshot => {
        ordersUl.innerHTML = '';
        const orders = snapshot.val() || {};

        for (let key in orders) {
            const order = orders[key];
            const li = document.createElement('li');
            li.textContent = `Service: ${order.service} | Status: ${order.status} | Trial: ${order.isTrial ? 'Yes' : 'No'} | Payment Required: ${order.paymentRequired ? 'Yes' : 'No'}`;
            ordersUl.appendChild(li);
        }
    });
}

// Call loadOrders to display existing orders
loadOrders();

// Logout button functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    firebase.auth().signOut().then(() => {
        window.location.href = "index.html";
    });
});