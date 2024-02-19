ute_url_base = "https://ade-production.ut-capitole.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?data="
lambda_domain = "vvq4ws26xtuivxfdmznouhi7ge0dpqcq.lambda-url.eu-west-3.on.aws"
const alphanumericRegex = /^[a-zA-Z0-9]+$/;

function courseChanged() {
    var courseDropdown = document.getElementById("courseDropdown");
    var originalUrlField = document.getElementById("original-url");
    var otherParent = document.getElementById("other-url-stuff");

    if (courseDropdown.value === "other") {
        otherParent.style.display = "block";
        originalUrlField.value = "";
    } else {
        var selectedOption = courseDropdown.options[courseDropdown.selectedIndex];

        otherParent.style.display = "none";
        originalUrlField.value = selectedOption.getAttribute("data-url");
    }

    updateOutputUrl();
}
document.addEventListener('DOMContentLoaded', function() {
    // after page refresh, hide/unhide the custom url field
    courseChanged();
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("original-url").placeholder = ute_url_base + 'something';
});
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("previous-url").placeholder = 'https://' + lambda_domain + '/...';
});

function updateOutputUrl() {
    var courseDropdown = document.getElementById("courseDropdown");
    var originalUrlField = document.getElementById("original-url");
    var filterDirection = document.getElementById("filter-direction").value
    var keywordsText = document.getElementById("keywords").value;
    var outputUrlField = document.getElementById("output-url");
    var textToShow = "";
    var urlId;

    console.log("Updating output URL");

    if (courseDropdown.value === "other") {
        const originalUrl = originalUrlField.value;
        if (! originalUrl.startsWith(ute_url_base)){
            originalUrlField.classList.add("badInput");
            outputUrlField.value = "Invalid URL";
        }else{
            urlId = originalUrl.replace(ute_url_base, '').trim();

            // Test the input against the regular expression
            if (!alphanumericRegex.test(urlId)){
                originalUrlField.classList.add("badInput");
                outputUrlField.value = "Invalid URL";
                return;
            }

            originalUrlField.classList.remove("badInput");
            console.log(`Found ${urlId} from original URL`);
        }
    }else{
        // grab URL id from data tag
        var selectedOption = courseDropdown.options[courseDropdown.selectedIndex];
        urlId = selectedOption.getAttribute("data-url")
    }

    // Constructing the URL
    const protocol = "https://";
    const basepath = `/ics/${urlId}`;
    const filterDirectionParam = `filter_direction=${filterDirection}`;

    // add keywords to parameters
    const feParams = keywordsText
    .split('\n')
    .map(line => line.trim())
    .filter(keyword => keyword !== '')
    .map(keyword => `fe=${encodeURIComponent(keyword)}`)
    .join('&');

    // Constructing the final URL
    const finalUrl = `${protocol}${lambda_domain}${basepath}?${filterDirectionParam}${feParams ? `&${feParams}` : ''}`;

    outputUrlField.value = finalUrl;

    updateWarning();
}

function updateWarning(){
   const filterDirection = document.getElementById("filter-direction").value;
   w = document.getElementById("exclusion-warning");
   if (filterDirection == 'blacklist'){
     w.style.display = 'block';
   }else{
     w.style.display = 'none';
   }
}

document.addEventListener('DOMContentLoaded', function() {
   updateWarning()
});

function copyToClipboard() {
    // Get the textarea element
    var textarea = document.getElementById("output-url");

    // Select the text in the textarea
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices

    // Copy the selected text to the clipboard
    document.execCommand("copy");

    // Deselect the textarea
    textarea.setSelectionRange(0, 0);

    console.log("Copied");
}

function showExplanations() {
    // Hide all paragraphs inside the explanations container
    var paragraphs = document.querySelectorAll('#explanations div');
    paragraphs.forEach(function(paragraph) {
        paragraph.style.display = 'none';
    });

    // Show the selected paragraph
    var selectedOption = document.getElementById('installation-target').value;
    var selectedParagraph = document.getElementById(selectedOption + "-explanation");
    selectedParagraph.style.display = 'block';
}
document.addEventListener('DOMContentLoaded', function() {
    // after page refresh, hide/unhide the custom url field
    showExplanations();
});

function reverseUrl(){
    var oldUrlField = document.getElementById("previous-url");
    const oldUrl = new URL(oldUrlField.value.trim());

    if (oldUrl.host != lambda_domain){
        oldUrlField.classList.add("badInput");
        console.log(`Received old URL, bad domain: ${oldUrl.host}`)
        return ;
    }else{
        var urlId = oldUrl.pathname.split('/').pop();

        if (!alphanumericRegex.test(urlId)){
            oldUrlField.classList.add("badInput");
            console.log("Received old URL, bad ID")
            return;
        }
        console.log(`urlId is ${urlId}`);
        // figure out if that's one of the known courseDropdowns
        // if yes, select it
        // if no, select other, and paste the URL into the custom URL field
        var selectElement = document.getElementById("courseDropdown");
        var correspondingCourse = selectElement.querySelector('option[data-url="' + urlId + '"]');
        var otherUrlField = document.getElementById("original-url");
        if (correspondingCourse) {
            // Option found, select it
            console.log(`course from URL is ${correspondingCourse.id}`);
            correspondingCourse.selected = true;
            otherUrlField.value = '';
        } else {
            console.log(`course from URL is unknown`);
            document.getElementById('other-course').selected = true;
            otherUrlField.value = oldUrlField.value;
        }

        var queryParams = new URLSearchParams(oldUrl.search);

        var filter_direction = queryParams.get("filter_direction"); // Returns "value1"
        if (! filter_direction){
            filter_direction = "blacklist";
        }
        document.getElementById("filter-direction").value = filter_direction;

        document.getElementById("keywords").value = queryParams.getAll("fe").join('\n');


        oldUrlField.classList.remove("badInput");
        updateOutputUrl();
    }

}