// booking.js
const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const uid = firebase.auth().currentUser.uid;
    const selectedService = orderForm['service'].value;
    const ordersRef = firebase.database().ref('orders/' + uid);

    // Check existing orders to determine trial status
    ordersRef.once('value', snapshot => {
        const orders = snapshot.val() || {};
        const trialOrders = Object.values(orders).filter(o => o.isTrial).length;

        // Determine if this order is a trial
        const isTrial = trialOrders < 5 ? true : false;

        // Add the new order
        const newOrderRef = ordersRef.push();
        newOrderRef.set({
            service: selectedService,
            status: "pending",
            isTrial: isTrial,
            date: new Date().toISOString(),
            paymentRequired: isTrial ? false : true
        });

        if(isTrial) {
            alert("This is a free trial order!");
        } else {
            alert("Payment required for this order.");
        }

        // Reset form after submission
        orderForm.reset();
    });
});