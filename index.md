---
layout: default
---
<section id="send_screen" class="expand">
  <div class="flex">
    <div class="flex-body">
      <div class="textarea-container">
        <div>
          <textarea id="textarea_message"></textarea>
        </div>
      </div>
    </div>
    <div class="flex-menu">
      <div class="flex-menu-2">
        <button id="button_send">
          <div>
            <span>Send</span>
          </div>
        </button><button id="button_clear">
          <div>
            <span>Clear</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</section>
<section id="sent_screen" class="expand" style="display:none;">
  <h2>
    <p>Share this URL:</p>
    <span id="uri"></span>
  </h2>
  <textarea style="display: none;" id="hidden_hash"></textarea>
</section>
