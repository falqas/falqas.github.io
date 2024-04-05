I was recently tinkering with the source code of some old Nintendo and Sega Genesis video games to implement some fun ROM hacks. Games of that era were primarily written in assembly language that was specific to that hardware architecture (6502 assembly for the NES, 68000 for the Genesis), which requires you to be familiar with hexadecimal notation. I don't use hex notation very often, aside from color values in CSS, so my ability to quickly read and reason through hex values was a bottleneck for me. I thought I could use some more practice - by that I mean, repeated exposure to hex values.

I thought about all the different ways I encounter numbers in my day to day, and the immediate answer that came to mind was a clock. I had envisioned a simple clock app on the iOS app store that could display time in various formats, ideally as a home screen widget so it would always be on display by default. Nothing too exotic, like [hexadecimal time](https://en.wikipedia.org/wiki/Hexadecimal_time) I just wanted to be able to represent a 24 hour day in hex notation. I looked around the app store to see if there was a clock app I could download...no luck.

Then I remembered my Raspberry Pi clock. I bought it a few years back when I was doing a lot of hardware tinkering. It's basically a Raspberry Pi Zero with a Scroll HAT ("Hardware Attached on Top") - a programmable board of LEDs that you can solder to your Pi, and can then use to spell out different things. It's in a little robot-shaped case, and it looks less ridiculous than it sounds:

![[Pasted image 20240320152749.png]]

I figured I would set this up in my living room, and it could be a fun way to mindlessly familiarize myself with hexadecimal notation.

I also realized that simply using an unfamiliar time notation would annoy the bejesus out of everyone else around me (see also: [the Metronome art exhibit in New York City](<https://en.wikipedia.org/wiki/Metronome_(public_artwork)>)) who, at best wouldn't understand it (what is 0A:30?), and at worst would misinterpret the value (the hex value 10:26 translates to 16:38 in decimal - that means 4:38pm, and not 10:26am.)

To minimize confusion, I set the time to switch between hexadecimal and decimal every five seconds. I also added minor formatting tweaks to make it easier to tell which version you're looking at; hexadecimal uses a blockier font, and lacks a separator between the hours and minutes values.

And here's what it looks like:

![[trim.21CD6192-2A36-4381-859F-488624E73B10.gif]]

Behold, the code:

```python
import time
from PIL import Image
import scrollphathd
from scrollphathd.fonts import font5x5, font3x5

print("""
Scroll pHAT HD: Clock

Displays hours and minutes in text,
plus a seconds progress bar.

Press Ctrl+C to exit!

""")

# Display a progress bar for seconds
# Displays a dot if False
DISPLAY_BAR = True

# Brightness of the seconds bar and text
BRIGHTNESS = 0.3

# Uncomment the below if your display is upside down
#   (e.g. if you're using it in a Pimoroni Scroll Bot)
scrollphathd.rotate(degrees=180)

SECONDS_TO_SCROLL_IMG = 1
IMAGE_BRIGHTNESS = 0.5

# Completely unnecessary, but this is to add a brief scrolling sinewave pattern on the robot's "mouth", every hour on the hour.
img = Image.open("mouth.bmp")

def decimal_to_hexadecimal(decimal_time):
    """
    Converts a decimal time string (HH:MM) to a hexadecimal time string.
    """
    # Split the decimal time into hours and minutes
    hours, minutes = decimal_time.split(':')

    # Convert hours and minutes to integers
    hours_int = int(hours)
    minutes_int = int(minutes)

    # Convert hours and minutes to hexadecimal strings, removing the '0x' prefix and making uppercase
    hours_hex = format(hours_int, '02X')
    minutes_hex = format(minutes_int, '02X')

    # Return the formatted hexadecimal time string
    return f".{hours_hex}{minutes_hex}"

def get_pixel(x, y):
    p = img.getpixel((x, y))

    if img.getpalette() is not None:
        r, g, b = img.getpalette()[p:p+3]
        p = max(r, g, b)

    return p / 255.0

scrollphathd.clear()
for x in range(0, scrollphathd.DISPLAY_WIDTH):
    for y in range(0, scrollphathd.DISPLAY_HEIGHT):
        brightness = get_pixel(x, y)
        scrollphathd.pixel(x, 6 - y, brightness * IMAGE_BRIGHTNESS)

# Display the image for a set duration
start_time = time.time()

while time.time() - start_time < SECONDS_TO_SCROLL_IMG:
    scrollphathd.show()
    time.sleep(0.03)
    scrollphathd.scroll(-1)
scrollphathd.clear()

# Initialize a variable to track the start time of the loop
loop_start_time = time.time()

# Variable to decide whether to display time in decimal (True) or hexadecimal (False)
display_decimal = True
font_to_display = font5x5 if display_decimal else font3x5

while True:
    scrollphathd.clear()

    # Grab the "seconds" component of the current time
    # and convert it to a range from 0.0 to 1.0
    float_sec = (time.time() % 60) / 59.0

    # Multiply our range by 15 to spread the current
    # number of seconds over 15 pixels.
    #
    # 60 is evenly divisible by 15, so that
    # each fully lit pixel represents 4 seconds.
    #
    # For example this is 28 seconds:
    # [x][x][x][x][x][x][x][ ][ ][ ][ ][ ][ ][ ][ ]
    #  ^ - 0 seconds                59 seconds - ^
    seconds_progress = float_sec * 15

    if DISPLAY_BAR:
        # Step through 15 pixels to draw the seconds bar
        for y in range(15):
            # For each pixel, we figure out its brightness by
            # seeing how much of "seconds_progress" is left to draw
            # If it's greater than 1 (full brightness) then we just display 1.
            current_pixel = min(seconds_progress, 1)

            # Multiply the pixel brightness (0.0 to 1.0) by our global brightness value
            scrollphathd.set_pixel(y + 1, 6, current_pixel * BRIGHTNESS)

            # Subtract 1 now we've drawn that pixel
            seconds_progress -= 1

            if seconds_progress <= 0:
                break

    else:
        # Just display a simple dot
        scrollphathd.set_pixel(int(seconds_progress), 6, BRIGHTNESS)


    # Check if 5 seconds have passed to toggle the display format
    if time.time() - loop_start_time >= 5:
        display_decimal = not display_decimal  # Toggle between True and False
        font_to_display = font5x5 if display_decimal else font3x5
        loop_start_time = time.time()  # Reset the loop start time

    # Display the time in the current format
    if display_decimal:
        # Display the time (HH:MM) in decimal format
        time_str = time.strftime("%H:%M")
    else:
        # Display the time in hexadecimal format, e.g., 14:45 becomes xE:2D
        time_str = decimal_to_hexadecimal(time.strftime("%H:%M"))

    scrollphathd.write_string(
        time_str,
        x=0,
        y=0,
        font=font_to_display,
        brightness=BRIGHTNESS
    )

    scrollphathd.show()
    time.sleep(0.1)

    # Check if it's exactly on the hour
    if time.strftime("%M%S") == "0000":
        scrollphathd.clear()
        for x in range(0, scrollphathd.DISPLAY_WIDTH):
            for y in range(0, scrollphathd.DISPLAY_HEIGHT):
                brightness = get_pixel(x, y)
                scrollphathd.pixel(x, 6 - y, brightness * IMAGE_BRIGHTNESS)

        # Display the image for a set duration
        start_time = time.time()
        while time.time() - start_time < SECONDS_TO_SCROLL_IMG:
            scrollphathd.show()
            time.sleep(0.03)
            scrollphathd.scroll(-1)
        scrollphathd.clear()




```

Now you can successfully confuse your friends and family with your weird way of telling time.

And as the sign at [Recurse Center](https://www.recurse.com/) reads:

![[Pasted image 20240405134737.png]]
