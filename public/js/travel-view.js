// Get the widget ID from the URL
const urlParams = new URLSearchParams(window.location.search);
const widgetId = urlParams.get("id");

// Define content for each widget based on its ID
const widgetContent = {
    "1": {
        heading: "Place 1 - Historical Landmark",
        image: "../download.jpg",
        details: "This is a historical landmark with a rich history dating back centuries. Visitors can explore the ancient architecture and learn about its cultural significance.",
        // Add the location for Place 1
        location: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15163249.187168477!2d11.448694360425154!3d21.897418365242757!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13883b64fb267151%3A0xd6406bdc582d7390!2sSahara%20Desert!5e0!3m2!1sen!2sin!4v1694680792128!5m2!1sen!2sin"
    },
    "2": {
        heading: "Place 2 - Natural Beauty",
        image: "../download (1).jpg",
        details: "Place 2 is known for its breathtaking natural beauty. It offers hiking trails, scenic views, and opportunities for wildlife photography.",
        // Add the location for Place 2
        location: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31867.209694093966!2d72.96309088167753!3d3.250042125660081!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b4715dde8109271%3A0xe6d6cee5ceeb6ee6!2sMaldive%20Islands!5e0!3m2!1sen!2sin!4v1694681209205!5m2!1sen!2sin"
    },
    "3": {
        heading: "Place 3 - Urban Exploration",
        image: "/a.jpg",
        details: "Place 3 is a bustling urban area with a vibrant street life. Explore the local markets, taste delicious street food, and interact with the friendly locals.",
        // Add the location for Place 3
        location: "https://www.google.com/maps/embed?pb=YOUR_PLACE_3_MAP_EMBED_LINK"
    },
    // Add more widget content as needed
};

// Define comments data for each place
// Retrieve comments from local storage or use an empty array if none exists
const commentsData = JSON.parse(localStorage.getItem("commentsData")) || {};

// Function to display comments for the selected place
function displayCommentsForPlace(placeId) {
    // Get the comments list element
    const commentsList = document.getElementById("comments-list");

    // Clear the existing comments
    commentsList.innerHTML = "";

    // Check if comments exist for the selected place
    if (commentsData.hasOwnProperty(placeId)) {
        const placeComments = commentsData[placeId];

        // Loop through comments and display them
        placeComments.forEach((comment) => {
            const li = document.createElement("li");
            li.textContent = comment;
            commentsList.appendChild(li);
        });
    }
}

// Display content and comments for the current place when the page loads
const currentContent = widgetContent[widgetId];
displayCommentsForPlace(widgetId);

// Display the content in the content container
const contentContainer = document.getElementById("content-container");
contentContainer.innerHTML = `<h2>${currentContent.heading}</h2><img src="${currentContent.image}" alt="${currentContent.heading}"><p>${currentContent.details}</p>`;

// Update the map's src attribute with the location for the current place
const mapElement = document.getElementById("map");
mapElement.innerHTML = `<iframe src="${currentContent.location}" width="400" height="300" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

// Add event listener to the comment form
const commentForm = document.getElementById("comment-form");
commentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get the user's comment from the input
    const commentInput = document.getElementById("comment");
    const newComment = commentInput.value.trim();

    if (newComment !== "") {
        // Store the new comment in the comments data for the current place
        if (!commentsData.hasOwnProperty(widgetId)) {
            commentsData[widgetId] = [];
        }
        commentsData[widgetId].push(newComment);

        // Display the updated comments for the current place
        displayCommentsForPlace(widgetId);

        // Clear the comment input
        commentInput.value = "";

        // Save comments data to local storage
        localStorage.setItem("commentsData", JSON.stringify(commentsData));
    }
});
