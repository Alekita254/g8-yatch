# G8 Website Photo Upload Guide

Put real G8 photos in this folder, then update `src/data/siteImages.js` so the matching slot points to your uploaded file.

Recommended filenames:

| Slot | Save Photo As | Why This Photo Matters |
| --- | --- | --- |
| Homepage hero | `home-hero.jpg` | First impression. Use the strongest actual G8 exterior, terrace, garden, restaurant or evening ambience photo. |
| Restaurant hero | `restaurant-hero.jpg` | Makes guests hungry and confident about food quality. Use real plated food, table setup or drinks. |
| Hotel hero | `hotel-hero.jpg` | Proves the accommodation is real and clean. Use room, bed, reception or exterior. |
| Experiences hero | `experiences-hero.jpg` | Sells family days, birthdays, garden events and play space. |
| Corporate hero | `corporate-hero.jpg` | Shows G8 can host meetings, trainings and team retreats. |
| Cabro hero | `cabro-hero.jpg` | Shows the cabro product, yard, delivery or finished paving. |
| Room cards | `room-garden.jpg`, `room-family.jpg`, `room-executive.jpg` | Help guests compare room quality and comfort. |
| Activity cards | `activity-accommodation.jpg`, `activity-conference.jpg`, `activity-garden.jpg`, `activity-team-building.jpg`, `activity-playground.jpg`, `activity-food.jpg` | Make each service feel specific and believable. |

Photo tips:

- Use landscape photos for page heroes when possible, but a good portrait phone photo also works.
- Keep important subjects near the center or right side; hero text often sits on the left.
- Avoid blurry WhatsApp-compressed photos for hero sections.
- Use real people only when you have permission.
- For food, shoot near a window or under warm restaurant light.
- For rooms, tidy the bed, open curtains, remove clutter and shoot from a corner.
- For events, show setup, seating, decor, people scale or garden space.

After adding photos, update `src/data/siteImages.js` by changing the matching `src` value to the `replaceWith` path.
