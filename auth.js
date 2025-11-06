// auth.js
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm['email'].value;
    const password = loginForm['password'].value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            if (user.email === "luminaryframestudios@gmail.com") {
                // Admin login
                window.location.href = "admin.html";
            } else {
                // Client login
                checkTrialAndRedirect(user.uid);
            }
        })
        .catch((error) => {
            alert(error.message);
        });
});

// Function to handle trial check and redirect to client panel
function checkTrialAndRedirect(uid) {
    const ordersRef = firebase.database().ref('orders/' + uid);

    ordersRef.once('value', snapshot => {
        const orders = snapshot.val() || {};
        const trialCount = Object.values(orders).filter(o => o.isTrial).length;

        if(trialCount < 5) {
            alert(`You have ${5 - trialCount} free trial orders left`);
        }

        window.location.href = "client.html"; // redirect to client panel
    });
}