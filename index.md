---
layout: default
---
<section id="welcome_screen" class="expand">
  <div class="flex">
    <div class="flex-body">
      <div class="flex-table-wrapper">
        <div class="flex-table-cell">
          <h1 class="logo">ORTClip</h1>
          <noscript>This web app uses JavaScript. Please enable JavaScript.</noscript>
          <p>The best way to share a secret message between you and someone.</p>
        </div>
      </div>
    </div>
    <div class="flex-menu">
      <div class="flex-menu-2">
        <button class="#edit_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
                <i class="fa fa-upload"></i>
                <p>Send</p>
            </div>
          </div>
        </button><button class="#scan_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
                <i class="fa fa-download"></i>
                <p>Get</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</section>

<section id="edit_screen" class="expand" style="display:none;">
  <div class="flex">
    <div class="flex-body">
      <div class="flex-table-wrapper">
        <div class="flex-table-cell">
          <textarea id="textarea_request_message"></textarea>
          <textarea style="display: none;" id="hidden_hash"></textarea>
        </div>
      </div>
    </div>
    <div class="flex-menu">
      <div class="flex-menu-2">
        <button class="#welcome_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <i class="fa fa-home"></i>
              <p>Home</p>
            </div>
          </div>
        </button><button class="#wait_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <i class="fa fa-upload"></i>
              <p>Send</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</section>

<section id="wait_screen" class="expand" style="display:none;">
  <div class="flex">
    <div class="flex-body">
      <div class="flex-table-wrapper">
        <div class="flex-table-cell">
          <h1>
            Please wait.
          </h1>
          <i id="waiting" class="fa fa-spinner fa-pulse"></i>
        </div>
      </div>
    </div>
  </div>
</section>

<section id="send_screen" class="expand" style="display:none;">
  <div class="flex">
    <div class="flex-body">
      <div class="flex-table-wrapper">
        <div class="flex-table-cell">
          <h1>Your code:</h1>
          <div id="qrcode">
            <div id="image_qrcode"></div>
          </div>
          <textarea id="textarea_qrcode" rows="1" readonly></textarea>
        </div>
      </div>
    </div>
    <div class="flex-menu">
      <div class="flex-menu-2">
        <button class="#welcome_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <i class="fa fa-home"></i>
              <p>Home</p>
            </div>
          </div>
        </button><button class="copy">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <i class="fa fa-clipboard"></i>
              Copy
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</section>

<section id="scan_screen" class="expand" style="display:none;">
  <div class="flex">
    <div class="flex-body">
      <div class="flex-table-wrapper">
        <div class="flex-table-cell">
          <h1>Scanning QR code</h1>
          <video id="video" width="256px" height="192px"></video>
          <canvas id="qr-canvas" width="256" height="192"></canvas>
          <p>Or, please input code.</p>
          <textarea id="textarea_code" rows="1"></textarea>
        </div>
      </div>
    </div>
    <div class="flex-menu">
      <div class="flex-menu-2">
        <button class="#welcome_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <i class="fa fa-home"></i>
              <p>Home</p>
            </div>
          </div>
        </button><button class="#wait_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <i class="fa fa-download"></i>
              <p>Get</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</section>

<section id="get_screen" class="expand" style="display:none;">
  <div class="flex">
    <div class="flex-body">
      <div class="flex-table-wrapper">
        <div class="flex-table-cell">
          <textarea id="textarea_response_message" readonly></textarea>
        </div>
      </div>
    </div>
    <div class="flex-menu">
      <div class="flex-menu-2">
        <button class="#welcome_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <i class="fa fa-home"></i>
              <p>Home</p>
            </div>
          </div>
        </button><button class="copy">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <span>
                <i class="fa fa-clipboard"></i>
                <p>Copy</p>
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</section>

<section id="error_screen" class="expand" style="display:none;">
  <div class="flex">
    <div class="flex-body">
      <div class="flex-table-wrapper">
        <div class="flex-table-cell">
          <h1>
            Ooops!
          </h1>
          <p>Sorry, a technical problem occurred.</p>
          <p>The error message is below:</p>
          <textarea id="textarea_error" readonly></textarea>
        </div>
      </div>
    </div>
    <div class="flex-menu">
      <div class="flex-menu-1">
        <button class="#welcome_screen">
          <div class="table-wrapper">
            <div class="table-cell-wrapper">
              <span>
                <i class="fa fa-home"></i>
                <p>Home</p>
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</section>
