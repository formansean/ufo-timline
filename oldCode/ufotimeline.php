<?php
/*
Template Name: Timeline Events
*/
get_header();

if (function_exists('patreon_make_current_user_object') && !patreon_make_current_user_object()->has_tier(10)) {
    ?>
    <style>
        .restricted-message {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f5f5f5;
        }
        .message-box {
            text-align: center;
            padding: 2rem;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .message-box h1 {
            color: #333;
            font-size: 24px;
            margin-bottom: 1rem;
        }
        .message-box p {
            color: #666;
            font-size: 16px;
        }
        .spinner {
            margin-top: 1rem;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-left: auto;
            margin-right: auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    <div class="restricted-message">
        <div class="message-box">
            <h1>Restricted Access</h1>
            <p>You must be logged in to view this page.</p>
            <p>Redirecting you in 5 seconds...</p>
            <div class="spinner"></div>
        </div>
    </div>
    <script>
        setTimeout(function() {
            window.location.href = 'https://theufotimeline.com/';
        }, 5000);
    </script>
    <?php
    exit;
}

$theme_url = get_template_directory_uri();
$template_file = basename(get_page_template());
$full_path = $theme_url . "/templates";

function get_top_scroller_items() {
    $items = get_field('top_scroller', 'option');
    $current_date = current_time('Ymd');
    $valid_items = array();

    if($items) {
        foreach($items as $item) {
            $start_date = DateTime::createFromFormat('d/m/Y', $item['start_date'])->format('Ymd');
            $end_date = DateTime::createFromFormat('d/m/Y', $item['end_date'])->format('Ymd');

            if($current_date >= $start_date && $current_date <= $end_date) {
                $valid_items[] = $item;
            }
        }
    }

    return $valid_items;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2908707594169097"
    crossorigin="anonymous"></script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>THE UFO TIMELINE</title>
    <link rel="stylesheet" href="<?php echo $full_path; ?>/styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">


    <!-- Add these lines for Splide -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/css/splide.min.css">
    <script src="https://cdn.jsdelivr.net/npm/@splidejs/splide@4.1.4/dist/js/splide.min.js"></script>

    <script type="text/javascript">
        var ajaxurl = "<?php echo admin_url('admin-ajax.php'); ?>";
        var topScrollerItems = <?php echo json_encode(get_top_scroller_items()); ?>;
    </script>
        <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
        <script type="text/javascript">
        var ajaxurl = "<?php echo admin_url('admin-ajax.php'); ?>";
        var topScrollerItems = <?php echo json_encode(get_top_scroller_items()); ?>;
    </script>
</head>
<body>
    <!-- Replace the existing user profile container with this -->
    <div id="user-profile-container">
        <button id="user-profile-button">👽 <?php echo esc_html($current_user->display_name); ?></button>
        <div id="user-profile-dropdown">
            <a href="#" id="submit-case-option">Submit a Case</a>
            <a href="#" id="settings-option">Settings</a>
            <a href="#" id="tutorial-option">Tutorial</a>
            <a href="<?php echo wp_logout_url(home_url()); ?>" id="logout-option">Logout</a>
        </div>
    </div>

    <div id="header-container">
        <h1 id="main-title">THE UFO TIMELINE</h1>
        <div id="this-day-container">
            <div id="this-day-header">
                <h2 id="this-day-heading">Today in UFO History</h2>
            </div>
            <h3 id="this-day-event-name"></h3>
        </div>
    </div>
    <!-- Add this just after the #header-container div -->
    </div>
    <div id="top-scroller-container">
        <div id="top-scroller"></div>
    </div>
    <div id="timeline-container">
        <div id="timeline"></div>
    </div>

    <div id="search-and-list-container">
        <div id="top-toggles-container">
            <div class="toggle-section">
                <h3>Craft</h3>
                <div id="craft-type-toggles"></div>
            </div>
            <div class="toggle-section">
                <h3>Entity</h3>
                <div id="entity-type-toggles"></div>
            </div>
        </div>
        <div id="search-container">
            <input type="text" id="search-input" placeholder="Search events...">
        </div>
        <button id="openEventListModal" class="control-button">Event List</button>
    </div>

    <div id="info-container">
        <div id="event-details" class="info-box">
            <button id="switch-container-btn" class="control-button">DEEP DIVE</button>
            <div id="event-content"></div>
        </div>
        <div id="globe-container" class="info-box">
            <div id="globe-category-toggles"></div>
        </div>
        <div id="toggles" class="info-box">
            <div id="donut-chart-container"></div>
            <button id="openEventListModal" class="control-button">Event List</button>
            <div id="search-container">
                <input type="text" id="search-input" placeholder="Search events...">
            </div>
            <div class="toggle-switch-container">
                <label class="toggle-switch" for="color-scheme-toggle">
                    <input type="checkbox" id="color-scheme-toggle">
                    <span class="slider round">
                        <span class="knob">
                            <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                            </svg>
                        </span>
                    </span>
                </label>
            </div>
        </div>
    </div>

    <div id="tooltip"></div>

    <script src="https://d3js.org/d3.v6.min.js"></script>
    <script src="https://d3js.org/topojson.v3.min.js"></script>
    <script>
        <?php
        // Function to handle array fields
        function handle_array_field($field) {
            if (is_array($field)) {
                return implode(', ', array_filter($field));
            }
            return $field ? $field : '';
        }

        // Function to handle link fields
        function handle_link_field($field) {
            if (is_array($field) && isset($field['url'])) {
                return str_replace('http://', 'https://', $field['url']);
            }
            return $field ? str_replace('http://', 'https://', $field) : '';
        }

        // Function to safely encode for JavaScript
        function js_encode($data) {
            return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
        }

        function handle_deep_dive_content($deep_dive_content) {
            $processed_deep_dive_content = array(
                'Videos' => array(),
                'Images' => array(),
                'Reports' => array(),
                'News Coverage' => array()
            );

            if ($deep_dive_content && is_array($deep_dive_content)) {
                foreach ($deep_dive_content as $item) {
                    $tab_content = $item['tab_content'];

                    switch ($tab_content) {
                        case 'Images':
                            if (!empty($item['images'])) {
                                $processed_deep_dive_content['Images'][] = [
                                    'type' => 'slider',
                                    'content' => array_map(function($image) {
                                        return str_replace('http://', 'https://', $image['url']);
                                    }, $item['images'])
                                ];
                            }
                            break;

                        case 'Video':
                            if (!empty($item['video'])) {
                                foreach ($item['video'] as $video) {
                                    $processed_deep_dive_content['Videos'][] = [
                                        'type' => 'video',
                                        'content' => [
                                            'video' => [
                                                [
                                                    'video_link' => $video['video_link']
                                                ]
                                            ]
                                        ]
                                    ];
                                }
                            }
                            break;

                        case 'Reports':
                            if (!empty($item['reports'])) {
                                foreach ($item['reports'] as $report) {
                                    if ($report['type_of_content'] == 'Pdf') {
                                        $processed_deep_dive_content['Reports'][] = [
                                            'type' => 'report',
                                            'content' => [
                                                'url' => str_replace('http://', 'https://', $report['report_pdf']['url']),
                                                'title' => $report['pdf_title'],
                                                'thumbnail' => str_replace('http://', 'https://', $report['pdf_thumbnail']['url'])
                                            ]
                                        ];
                                    } elseif ($report['type_of_content'] == 'Images') {
                                        $processed_deep_dive_content['Reports'][] = [
                                            'type' => 'image',
                                            'content' => array_map(function($image) {
                                                return str_replace('http://', 'https://', $image['url']);
                                            }, $report['report_images'])
                                        ];
                                    }
                                }
                            }
                            break;

                        case 'News Coverage':
                            if (!empty($item['news_coverage'])) {
                                foreach ($item['news_coverage'] as $news) {
                                    if ($news['type_of_content'] == 'Video') {
                                        $processed_deep_dive_content['News Coverage'][] = [
                                            'type' => 'video',
                                            'content' => [
                                                'url' => str_replace('http://', 'https://', $news['news_video']['url']),
                                                'title' => $news['video_title'],
                                                'thumbnail' => str_replace('http://', 'https://', $news['video_thumbnail']['url'])
                                            ]
                                        ];
                                    } elseif ($news['type_of_content'] == 'Image') {
                                        $processed_deep_dive_content['News Coverage'][] = [
                                            'type' => 'image',
                                            'content' => array_map(function($image) {
                                                return str_replace('http://', 'https://', $image['url']);
                                            }, $news['news_images'])
                                        ];
                                    }
                                }
                            }
                            break;
                    }
                }
            }

            return $processed_deep_dive_content;
        }

        $args = array(
            'post_type' => 'custom_post',
            'posts_per_page' => -1,
            'orderby' => 'date',
            'order' => 'ASC'
        );

        $query = new WP_Query($args);

        if ($query->have_posts()) :
            $events = array();
            while ($query->have_posts()) : $query->the_post();
                $deep_dive_content = get_field('deep_dive_content');
                $processed_deep_dive_content = handle_deep_dive_content($deep_dive_content);

                $events[] = array(
                    "id" => get_the_ID(),
                    "title" => get_the_title(),
                    "category" => get_field('category'),
                    "date" => get_field('date'),
                    "time" => get_field('time'),
                    "location" => get_field('location'),
                    "city" => get_field('city'),
                    "state" => get_field('state'),
                    "country" => get_field('country'),
                    "latitude" => get_field('latitude'),
                    "longitude" => get_field('longitude'),
                    "craft_type" => handle_array_field(get_field('craft_type')),
                    "craft_size" => handle_array_field(get_field('craft_size')),
                    "entity_type" => handle_array_field(get_field('entity_type')),
                    "close_encounter_scale" => handle_array_field(get_field('close_encounter_scale')),
                    "craft_behavior" => handle_array_field(get_field('craft_behavior')),
                    "physical_effects" => get_field('physical_effects'),
                    "witnesses" => get_field('witnesses'),
                    "eyewitness" => handle_array_field(get_field('eyewitness')),
                    "duration" => get_field('duration'),
                    "weather" => handle_array_field(get_field('weather')),
                    "photo" => get_field('photo'),
                    "video" => get_field('video'),
                    "color" => handle_array_field(get_field('color')),
                    "sound_or_noise" => handle_array_field(get_field('sound_or_noise')),
                    "radar" => get_field('radar'),
                    "credibility" => get_field('credibility'),
                    "notoriety" => get_field('notoriety'),
                    "telepathic_communication" => handle_array_field(get_field('telepathic_communication')),
                    "recurring_sightings" => get_field('recurring_sightings'),
                    "artifacts_or_relics" => handle_array_field(get_field('artifacts_or_relics')),
                    "government_involvement" => handle_array_field(get_field('government_involvement')),
                    "light_characteristics" => handle_array_field(get_field('light_characteristics')),
                    "temporal_distortions" => handle_array_field(get_field('temporal_distortions')),
                    "media_link" => handle_link_field(get_field('media_link')),
                    "detailed_summary" => get_field('detailed_summary'),
                    "symbols" => handle_array_field(get_field('symbols')),
                    "deep_dive_content" => $processed_deep_dive_content,
                    "likes" => get_post_meta(get_the_ID(), 'event_likes', true) ?: 0,
                    "dislikes" => get_post_meta(get_the_ID(), 'event_dislikes', true) ?: 0,
                );
            endwhile;
            echo 'var ufo_events = ' . js_encode($events) . ';';
        else :
            echo 'var ufo_events = [];';
        endif;

        wp_reset_postdata();
        ?>
    </script>
    <script src="<?php echo $full_path; ?>/script.js" type="module"></script>
    <script type="text/javascript">
var wpApiSettings = {
    root: '<?php echo esc_url_raw(rest_url()); ?>',
    nonce: '<?php echo wp_create_nonce('wp_rest'); ?>'
};
</script>
<script src="<?php echo $full_path; ?>/script.js" type="module"></script>
</script>
<script src="<?php echo $full_path; ?>/script.js" type="module"></script>
    <div id="deepDiveModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <div id="modalContent"></div>
        </div>
    </div>
    <script>
        // Function to process PDF shortcodes
        function processPDFShortcodes() {
            const pdfViewers = document.querySelectorAll('.pdf-viewer');
            pdfViewers.forEach(viewer => {
                const shortcode = viewer.innerHTML.trim();
                if (shortcode.startsWith('[pdf-embedder') && shortcode.endsWith(']')) {
                    // Extract the URL from the shortcode
                    const urlMatch = shortcode.match(/url="([^"]+)"/);
                    if (urlMatch && urlMatch[1]) {
                        const pdfUrl = urlMatch[1];
                        // Replace the shortcode with an iframe
                        viewer.innerHTML = `<iframe src="${pdfUrl}" width="100%" height="600px" style="border: none;"></iframe>`;
                    }
                }
            });
        }

        // Call the function when the modal content is loaded
        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('deepDiveModal');
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'childList') {
                        processPDFShortcodes();
                    }
                });
            });
            observer.observe(modal, { childList: true, subtree: true });
        });
        function rateEvent(eventId, ratingType) {
    console.log('Attempting to rate event:', { eventId, ratingType });

    if (localStorage.getItem(`rated_${eventId}`)) {
        console.log('User has already rated this event');
        alert('You have already rated this event.');
        return;
    }

    if (typeof ajaxurl === 'undefined') {
        console.error('ajaxurl is not defined');
        alert('Unable to submit rating at this time. Please try again later.');
        return;
    }

    const data = new FormData();
    data.append('action', 'rate_event');
    data.append('event_id', eventId);
    data.append('rating_type', ratingType);

    console.log('Sending AJAX request with data:', Object.fromEntries(data));

    jQuery.ajax({
        url: ajaxurl,
        type: 'POST',
        data: data,
        processData: false,
        contentType: false,
        success: function(response) {
            console.log('Received response:', response);
            if (response.success) {
                console.log('Rating successful:', response.data.message);
                const button = document.querySelector(`.rating-button.${ratingType}[data-event-id="${eventId}"]`);
                const countSpan = button.querySelector(`.${ratingType}-count`);
                countSpan.textContent = response.data.newCount || (parseInt(countSpan.textContent) + 1);

                localStorage.setItem(`rated_${eventId}`, ratingType);

                document.querySelectorAll(`.rating-button[data-event-id="${eventId}"]`).forEach(btn => {
                    btn.disabled = true;
                    btn.classList.add('voted');
                });
            } else {
                console.error('Rating failed:', response.data.message);
                alert(response.data.message || 'An error occurred while rating the event.');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX error:', status, error);
            console.error('Response:', xhr.responseText);
            alert(`An error occurred while rating the event: ${error}`);
        }
    });
}
    </script>
    <div id="donationModal" class="modal">
    <div class="modal-content">
        <h2>SUPPORT THE UFO TIMELINE</h2>
        <p>I created this site for everyone to use for free. Any donations go directly toward maintaining and improving the site. Your support helps keep this resource available and growing for the community.</p>
        <div class="modal-buttons">
            <button id="donateButton" class="modal-button">Donate</button>
            <button id="continueButton" class="modal-button">Continue without donating</button>
        </div>
    </div>
</div>

<div id="paymentModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Make a Donation</h2>
        <div id="paypal-button-container"></div>
        <button id="backButton" class="back-button">Back to options</button>
    </div>
</div>

<div id="categoryModal" class="category-modal">
    <div class="category-modal-content">
        <div id="categoryModalContent"></div>
    </div>
</div>

<!-- Add this just before the closing </body> tag -->
<div id="eventListModal"></div>
<!-- Add this at the end of the body, just before the closing </body> tag -->
<div id="submit-case-modal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Submit a Case</h2>
        <p>Coming Soon</p>
    </div>
</div>
<!-- Add this just before the closing </body> tag -->
<div id="welcomeModal" class="modal">
    <div class="modal-content">
        <h2>THE UFO TIMELINE</h2>
        <p>The Ultimate UFO Research Tool</p>
        <div class="modal-buttons">
            <a href="https://www.paypal.com/ncp/payment/MYKCZ6XC736XL" target="_blank" class="modal-button">Donate</a>
            <button id="welcomeContinueButton" class="modal-button">Continue</button>
        </div>
    </div>
</div>
<!-- Add this just after the opening <body> tag -->
<div id="top-links">
    <a href="https://www.paypal.com/ncp/payment/MYKCZ6XC736XL" target="_blank">Donate</a>
    <a href="https://www.patreon.com/theufotimeline" target="_blank">Patreon</a>
    <a href="https://youtu.be/MWxLjZcQJ5I" id="tutorial-link" target="_blank">Tutorial</a>
    <a href="#" id="about-link">About</a>
</div>
<!-- Add this just before the closing </body> tag -->
<div id="aboutModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>About The UFO Timeline</h2>
        <p>Hello, I'm Sam Lingle, creator of The UFO Timeline. A Portland, Oregon native, I graduated from film school and began my career as a music video director. My fascination with UFO research began in childhood and has remained a driving force in my life.</p>
        <p>Throughout my research, I found that making sense of UFO history's complex timeline was challenging. I envisioned a tool that could display comprehensive UFO data chronologically in a single, intuitive interface. When I discovered this resource didn't exist, I took action. In July 2024, I taught myself to code and developed this website from scratch.</p>
        <p>I take immense pride in this platform and hope it serves as a valuable resource for UFO researchers worldwide. The site undergoes daily improvements, with new cases added and existing ones updated as fresh information emerges. I remain optimistic that through collaborative efforts and shared knowledge, we can unravel these enduring mysteries together.</p>
        <p>- Sam Lingle : Father, UFOlogist, Videographer</p>
    </div>
</div>
<!-- Add this modal div just before the closing </body> tag -->
<div id="donateModal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <h2>Donate to The UFO Timeline</h2>
        <p>Thank you for considering a donation to support The UFO Timeline.</p>
        <div class="modal-buttons">
            <a href="https://www.paypal.com/ncp/payment/MYKCZ6XC736XL" target="_blank" class="modal-button">Donate via PayPal</a>
        </div>
    </div>
</div>

<!-- Modify the existing script section or replace it with this -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    const donateLink = document.getElementById('donate-link');
    const donateModal = document.getElementById('donateModal');
    const closeBtn = donateModal.querySelector('.close');
    const welcomeModal = document.getElementById('welcomeModal');
    const welcomeDonateButton = document.getElementById('welcomeDonateButton');
    const welcomeContinueButton = document.getElementById('welcomeContinueButton');

    function openDonateModal(e) {
        if (e) e.preventDefault();
        donateModal.style.display = 'block';
        if (welcomeModal) welcomeModal.style.display = 'none';
    }

    function closeDonateModal() {
        donateModal.style.display = 'none';
    }

    if (donateLink) {
        donateLink.onclick = openDonateModal;
    }

    if (closeBtn) {
        closeBtn.onclick = closeDonateModal;
    }

    if (welcomeDonateButton) {
        welcomeDonateButton.onclick = openDonateModal;
    }

    if (welcomeContinueButton) {
        welcomeContinueButton.onclick = function() {
            if (welcomeModal) welcomeModal.style.display = 'none';
        }
    }

    window.onclick = function(event) {
        if (event.target == donateModal) {
            closeDonateModal();
        }
    }
});
</script>

<!-- Update the script section -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Get all modal elements
    const welcomeModal = document.getElementById('welcomeModal');
    const donateModal = document.getElementById('donateModal');
    const aboutModal = document.getElementById('aboutModal');

    // Get all button and link elements
    const welcomeContinueButton = document.getElementById('welcomeContinueButton');
    const donateLink = document.getElementById('donate-link');
    const aboutLink = document.getElementById('about-link');
    const closeButtons = document.querySelectorAll('.close');

    // Welcome Modal functionality
    if (welcomeModal && welcomeContinueButton) {
        welcomeContinueButton.addEventListener('click', function() {
            welcomeModal.style.display = 'none';
        });
    }

    // About Modal functionality
    if (aboutModal && aboutLink) {
        aboutLink.addEventListener('click', function(e) {
            e.preventDefault();
            aboutModal.style.display = 'block';
        });
    }

    // Close button functionality for all modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
});
</script>
</body>
</html>

<?php

function rate_event() {
    error_log("rate_event function called");
    error_log("POST data: " . print_r($_POST, true));

    try {
        // Check if required POST data is present
        if (!isset($_POST['event_id']) || !isset($_POST['rating_type'])) {
            throw new Exception("Missing required POST data");
        }

        // Sanitize and validate input data
        $event_id = intval($_POST['event_id']);
        $rating_type = sanitize_text_field($_POST['rating_type']);
        $user_id = get_current_user_id();

        error_log("Processed data - Event ID: $event_id, Rating Type: $rating_type, User ID: $user_id");

        // Validate rating type
        if (!in_array($rating_type, ['like', 'dislike'])) {
            throw new Exception("Invalid rating type: $rating_type");
        }

        // Get user's existing ratings
        $user_ratings = get_user_meta($user_id, 'event_ratings', true);
        if ($user_ratings === false) {
            throw new Exception("Failed to retrieve user ratings");
        }
        $user_ratings = $user_ratings ?: array();

        // Check if user has already rated this event
        if (!isset($user_ratings[$event_id])) {
            // Determine which meta key to update based on rating type
            $meta_key = $rating_type === 'like' ? 'event_likes' : 'event_dislikes';

            // Get current rating count
            $current_count = get_post_meta($event_id, $meta_key, true);
            if ($current_count === false) {
                throw new Exception("Failed to retrieve current count for event $event_id");
            }
            $current_count = $current_count ?: 0;
            $new_count = $current_count + 1;

            // Update post meta with new rating count
            $update_result = update_post_meta($event_id, $meta_key, $new_count);
            if ($update_result === false) {
                throw new Exception("Failed to update post meta for event $event_id");
            }

            // Record user's rating
            $user_ratings[$event_id] = $rating_type;
            $update_user_result = update_user_meta($user_id, 'event_ratings', $user_ratings);
            if ($update_user_result === false) {
                throw new Exception("Failed to update user meta for user $user_id");
            }

            error_log("Rating recorded successfully for event $event_id");
            wp_send_json_success(array('message' => 'Rating recorded successfully.', 'newCount' => $new_count));
        } else {
            throw new Exception("User already rated event $event_id");
        }
    } catch (Exception $e) {
        error_log("Error in rate_event: " . $e->getMessage());
        wp_send_json_error(array('message' => $e->getMessage()));
    }

    wp_die();
}

// Hook the function to WordPress AJAX actions
add_action('wp_ajax_rate_event', 'rate_event');
add_action('wp_ajax_nopriv_rate_event', 'rate_event');

get_footer();

?>



















