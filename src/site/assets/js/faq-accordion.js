document.addEventListener('DOMContentLoaded', function() {
    const contentContainer = document.querySelector('.page-content .col-lg-8');
    if (!contentContainer) return;

    const headings = contentContainer.querySelectorAll('h3');
    if (headings.length === 0) return;

    const accordionId = 'faqAccordion';
    const accordion = document.createElement('div');
    accordion.className = 'accordion custom-accordion';
    accordion.id = accordionId;

    headings.forEach((heading, index) => {
        const question = heading.textContent;
        const answerElements = [];
        let nextSibling = heading.nextElementSibling;

        // Collect all elements until the next H3 or end of container
        while (nextSibling && nextSibling.tagName !== 'H3') {
            answerElements.push(nextSibling);
            nextSibling = nextSibling.nextElementSibling;
        }

        // Create Accordion Item
        const itemId = `collapse${index}`;
        const headerId = `heading${index}`;

        const item = document.createElement('div');
        item.className = 'accordion-item border-0 mb-3 shadow-sm rounded overflow-hidden';

        const header = document.createElement('h2');
        header.className = 'accordion-header';
        header.id = headerId;

        const button = document.createElement('button');
        button.className = `accordion-button ${index !== 0 ? 'collapsed' : ''} fw-bold py-3`;
        button.type = 'button';
        button.setAttribute('data-bs-toggle', 'collapse');
        button.setAttribute('data-bs-target', `#${itemId}`);
        button.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
        button.setAttribute('aria-controls', itemId);
        button.textContent = question;
        
        // Add custom style to button
        button.style.backgroundColor = '#f8f9fa';
        button.style.color = '#2c3e50';

        header.appendChild(button);
        item.appendChild(header);

        const collapse = document.createElement('div');
        collapse.id = itemId;
        collapse.className = `accordion-collapse collapse ${index === 0 ? 'show' : ''}`;
        collapse.setAttribute('aria-labelledby', headerId);
        collapse.setAttribute('data-bs-parent', `#${accordionId}`);

        const body = document.createElement('div');
        body.className = 'accordion-body bg-white text-secondary';
        
        // Move answer elements to body
        answerElements.forEach(el => body.appendChild(el));

        collapse.appendChild(body);
        item.appendChild(collapse);
        accordion.appendChild(item);
    });

    // Insert accordion before the first H3
    if (headings.length > 0) {
        headings[0].parentNode.insertBefore(accordion, headings[0]);
        
        // Remove the original H3s (answer elements are already moved)
        headings.forEach(h3 => h3.remove());
    }
});
