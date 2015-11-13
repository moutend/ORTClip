---
layout: default
---
<section id="editMessage_screen" class="expand">
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
            <span>
              <i class="fa fa-send"></i>
              <p>Send</p>
            </span>
          </div>
        </button><button id="button_clear">
          <div>
            <span>
              <i class="fa fa-eraser"></i>
              <p>Clear</p>
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
  <textarea style="display: none;" id="hidden_hash"></textarea>
</section>

<section id="sendingMessage_screen" class="expand" style="display:none;">
  <h1>
    Please wait.
  </h1>
  <div>
    <i id="waiting" class="fa fa-spinner fa-pulse"></i>
  </div>
</section>

<section id="sendMessage_screen" class="expand" style="display:none;">
  <h1>
    Your URL:
  </h1>
  <div id="qrcode_and_url">
    <div id="QRCode"></div>
    <input id="input_uri" readonly />
  </div>
</section>

<section id="recieveMessage_screen" class="expand" style="display:none;">
  <div class="flex">
    <div class="flex-body">
      <div class="textarea-container">
        <div>
          <textarea id="textarea_recieve" readonly></textarea>
        </div>
      </div>
    </div>
    <div class="flex-menu">
      <div class="flex-menu-1">
        <button id="button_copy">
          <div>
            <span>
              <i class="fa fa-clipboard"></i>
              <p>Copy</p>
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</section>

<section id="error_screen" class="expand" style="display:none;">
  <h1>
    Ooops!
  </h1>
  <p>
    The error message is below:
  </h2>
  <textarea id="textarea_error" readonly></textarea>
</section>
