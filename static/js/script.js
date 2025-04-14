// Main JS file for WikiTruth app

/**
 * Tab switching functionality for article view
 */
function switchTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tabs
    const tabs = document.querySelectorAll('.article-tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show the selected tab content
    const selectedContent = document.getElementById(tabName + '-content');
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Add active class to selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
}

/**
 * Copy share link and show feedback
 */
function copyShareLink() {
    const shareLinkInput = document.getElementById('shareLink');
    if (shareLinkInput) {
        shareLinkInput.select();
        document.execCommand('copy');
        
        // Show success message
        const copyMessage = document.getElementById('copyMessage');
        if (copyMessage) {
            copyMessage.style.display = 'block';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 2000);
        }
        
        // Update button appearance
        const button = shareLinkInput.nextElementSibling;
        if (button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i data-feather="check"></i>';
            feather.replace();
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                feather.replace();
            }, 2000);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Feather icons
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
    
    // Add click event for copy button
    const copyButtons = document.querySelectorAll('.btn-copy');
    if (copyButtons) {
        copyButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    copyToClipboard(document.getElementById(targetId).value);
                    
                    // Change button icon temporarily to show success
                    const originalHTML = this.innerHTML;
                    this.innerHTML = '<i data-feather="check"></i>';
                    feather.replace();
                    
                    setTimeout(() => {
                        this.innerHTML = originalHTML;
                        feather.replace();
                    }, 2000);
                }
            });
        });
    }
    
    // Add click event for highlight toggle buttons
    const highlightToggles = document.querySelectorAll('.toggle-highlight-btn');
    if (highlightToggles) {
        highlightToggles.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                if (targetId) {
                    const target = document.getElementById(targetId);
                    if (target) {
                        if (target.style.display === 'none' || !target.style.display) {
                            target.style.display = 'block';
                        } else {
                            target.style.display = 'none';
                        }
                    }
                }
            });
        });
    }
    
    // Initialize Sharer.js if available
    if (window.Sharer) {
        window.Sharer.init();
    }
    
    // Add click event for translate section buttons
    const translateButtons = document.querySelectorAll('.translate-section-btn');
    if (translateButtons) {
        translateButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const sectionId = this.getAttribute('data-section');
                const fromLang = this.getAttribute('data-from');
                const toLang = this.getAttribute('data-to');
                
                if (sectionId && fromLang && toLang) {
                    translateSection(sectionId, fromLang, toLang);
                }
            });
        });
    }
    
    // Add event listener for back to TOC button
    const backToTocButton = document.getElementById('back-to-toc');
    if (backToTocButton) {
        // Initially hide the button
        backToTocButton.style.display = 'none';
        
        // Show the button when scrolled down
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTocButton.style.display = 'flex';
            } else {
                backToTocButton.style.display = 'none';
            }
        });
        
        // Scroll to TOC when clicked
        backToTocButton.addEventListener('click', function() {
            const toc = document.querySelector('.table-of-contents');
            if (toc) {
                toc.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    
    // Add event listener for highlights toggle button
    const toggleHighlightsBtn = document.getElementById('toggle-highlights-btn');
    if (toggleHighlightsBtn) {
        toggleHighlightsBtn.addEventListener('click', function() {
            const highlightsBtnText = document.getElementById('highlights-btn-text');
            const articleContainer = document.querySelector('.article-container');
            
            // Toggle highlight mode class
            articleContainer.classList.toggle('highlight-mode');
            
            // Update button text
            if (articleContainer.classList.contains('highlight-mode')) {
                if (highlightsBtnText) {
                    highlightsBtnText.textContent = 'Hide Reviews';
                }
                // Show only highlighted content
                showOnlyHighlights(true);
            } else {
                if (highlightsBtnText) {
                    highlightsBtnText.textContent = 'Show Reviews';
                }
                // Show all content
                showOnlyHighlights(false);
            }
        });
    }
});

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    if (!text) return;
    
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed'; // Prevent scrolling to bottom
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        // Execute copy command
        document.execCommand('copy');
        console.log('Text copied to clipboard');
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    // Clean up
    document.body.removeChild(textarea);
}

/**
 * Apply highlights to text
 */
function applyHighlights(sectionId, highlights) {
    if (!highlights || !highlights.length) return;
    
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Get current HTML content
    let html = section.innerHTML;
    
    // Sort highlights by length (longest first) to handle nested highlights properly
    highlights.sort((a, b) => b.text.length - a.text.length);
    
    // Replace each highlight with a marked version
    highlights.forEach(highlight => {
        const text = highlight.text;
        if (!text) return;
        
        try {
            // Escape the text for use in regex (to handle special characters)
            const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedText = escapeRegExp(text);
            
            // Create a regex to find the text
            const regex = new RegExp(escapedText, 'g');
            
            // Use regex replacement for more accuracy
            html = html.replace(regex, `<mark>${text}</mark>`);
        } catch (e) {
            console.error('Error applying highlight:', e);
            
            // Fallback to simple replacement if regex fails
            const parts = html.split(text);
            if (parts.length > 1) {
                html = parts.join(`<mark>${text}</mark>`);
            }
        }
    });
    
    // Update section HTML
    section.innerHTML = html;
}

/**
 * Save a highlight
 */
function saveHighlight(event, articleId, context) {
    event.preventDefault();
    
    const form = event.target;
    const textareaId = 'highlight-text-' + context.replace('section-', '');
    const textarea = document.getElementById(textareaId);
    const textToHighlight = textarea.value.trim();
    
    if (!textToHighlight) {
        alert('Please enter text to highlight');
        return;
    }
    
    // Submit highlight via AJAX
    fetch('/save-highlight', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'article_id': articleId,
            'text_to_highlight': textToHighlight,
            'context': context
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear the textarea
            textarea.value = '';
            
            // Hide the form
            const formContainer = form.closest('.highlight-form');
            formContainer.style.display = 'none';
            
            // Show success message
            alert('Text marked for review!');
            
            // Don't reload but show highlights instantly
            showOnlyHighlights(true);
        } else {
            alert('Error: ' + (data.error || 'Could not save highlight'));
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error saving highlight');
    });
}

/**
 * Progressive section-by-section translation
 */
function translateSection(sectionId, fromLang, toLang) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Get the text to translate
    const textToTranslate = section.innerText || section.textContent;
    if (!textToTranslate.trim()) return;
    
    // Show loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'translation-loading';
    loadingIndicator.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div> Translating...';
    section.parentNode.insertBefore(loadingIndicator, section.nextSibling);
    
    // Create form data
    const formData = new FormData();
    formData.append('text', textToTranslate);
    formData.append('from_lang', fromLang);
    formData.append('to_lang', toLang);
    
    // Make fetch request
    fetch('/translate-section', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        if (data.translated_text) {
            // Create translation container
            const translationContainer = document.createElement('div');
            translationContainer.className = 'translated-content';
            translationContainer.innerHTML = `
                <div class="translation-header">
                    <span class="translation-label">Translated to ${toLang}</span>
                </div>
                <div class="translation-text">${data.translated_text}</div>
            `;
            
            // Remove any existing translation
            const existingTranslation = section.nextElementSibling;
            if (existingTranslation && existingTranslation.classList.contains('translated-content')) {
                existingTranslation.remove();
            }
            
            // Add new translation
            section.parentNode.insertBefore(translationContainer, section.nextSibling);
        } else if (data.error) {
            alert('Translation error: ' + data.error);
        }
    })
    .catch(error => {
        // Remove loading indicator
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        
        console.error('Error translating section:', error);
        alert('Error translating section. Please try again.');
    });
}

/**
 * Show only highlighted content
 */
function showOnlyHighlights(showOnly) {
    // Update button text
    const btnText = document.getElementById('highlights-btn-text');
    if (btnText) {
        btnText.textContent = showOnly ? 'Hide Reviews' : 'Show Reviews';
    }
    
    // Load highlights data from server for this article
    const articleId = document.querySelector('meta[name="article-id"]')?.content;
    
    if (showOnly && articleId) {
        // Apply highlights directly to article text
        fetch(`/save-highlight`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                'article_id': articleId,
                'text_to_highlight': '',  // Empty to just retrieve current highlights
                'context': 'retrieve_only'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.highlights && data.highlights.length > 0) {
                // Process each highlight and apply it directly to the text
                data.highlights.forEach(highlight => {
                    // Apply highlight to the actual content
                    if (highlight.context === 'summary') {
                        const summary = document.getElementById('article-summary');
                        if (summary) {
                            let summaryHtml = summary.innerHTML;
                            try {
                                const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const escapedText = escapeRegExp(highlight.text);
                                const regex = new RegExp(escapedText, 'g');
                                summaryHtml = summaryHtml.replace(regex, `<mark>${highlight.text}</mark>`);
                                summary.innerHTML = summaryHtml;
                            } catch (e) {
                                console.error('Error highlighting in summary:', e);
                            }
                        }
                    } else if (highlight.context.startsWith('section-')) {
                        const sectionNumber = highlight.context.replace('section-', '');
                        const sectionContent = document.getElementById(`section-content-${sectionNumber}`);
                        if (sectionContent) {
                            let sectionHtml = sectionContent.innerHTML;
                            try {
                                const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                                const escapedText = escapeRegExp(highlight.text);
                                const regex = new RegExp(escapedText, 'g');
                                sectionHtml = sectionHtml.replace(regex, `<mark>${highlight.text}</mark>`);
                                sectionContent.innerHTML = sectionHtml;
                            } catch (e) {
                                console.error('Error highlighting in section:', e);
                            }
                        }
                    }
                });
                
                // Show a small notification of how many highlights are shown
                if (data.highlights.length > 0) {
                    const notification = document.createElement('div');
                    notification.className = 'alert alert-success highlight-notification';
                    notification.style.position = 'fixed';
                    notification.style.top = '10px';
                    notification.style.right = '10px';
                    notification.style.zIndex = '9999';
                    notification.style.padding = '10px 15px';
                    notification.style.borderRadius = '4px';
                    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                    notification.innerHTML = `<i data-feather="check-circle"></i> Showing ${data.highlights.length} highlighted review${data.highlights.length > 1 ? 's' : ''}`;
                    document.body.appendChild(notification);
                    
                    // Replace feather icons
                    if (window.feather) {
                        feather.replace();
                    }
                    
                    // Remove notification after 3 seconds
                    setTimeout(() => {
                        notification.remove();
                    }, 3000);
                }
            } else {
                // Show a notification that no highlights were found
                const notification = document.createElement('div');
                notification.className = 'alert alert-warning highlight-notification';
                notification.style.position = 'fixed';
                notification.style.top = '10px';
                notification.style.right = '10px';
                notification.style.zIndex = '9999';
                notification.style.padding = '10px 15px';
                notification.style.borderRadius = '4px';
                notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                notification.innerHTML = `<i data-feather="info"></i> No reviews have been marked for this article`;
                document.body.appendChild(notification);
                
                // Replace feather icons
                if (window.feather) {
                    feather.replace();
                }
                
                // Remove notification after 3 seconds
                setTimeout(() => {
                    notification.remove();
                }, 3000);
            }
        })
        .catch(error => {
            console.error('Error fetching highlights:', error);
            // Show error notification
            const notification = document.createElement('div');
            notification.className = 'alert alert-danger highlight-notification';
            notification.style.position = 'fixed';
            notification.style.top = '10px';
            notification.style.right = '10px';
            notification.style.zIndex = '9999';
            notification.style.padding = '10px 15px';
            notification.style.borderRadius = '4px';
            notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            notification.innerHTML = `<i data-feather="alert-triangle"></i> Error loading review highlights`;
            document.body.appendChild(notification);
            
            // Replace feather icons
            if (window.feather) {
                feather.replace();
            }
            
            // Remove notification after 3 seconds
            setTimeout(() => {
                notification.remove();
            }, 3000);
        });
    } else {
        // Remove highlights from the actual content
        document.querySelectorAll('mark').forEach(mark => {
            const parent = mark.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(mark.textContent), mark);
                parent.normalize(); // Merge adjacent text nodes
            }
        });
        
        // Remove any existing highlight notifications
        document.querySelectorAll('.highlight-notification').forEach(notification => {
            notification.remove();
        });
    }
}
