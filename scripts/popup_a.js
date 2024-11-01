document.addEventListener('DOMContentLoaded', () => {
  const stars = document.querySelectorAll('.star');
  const ratingValue = document.getElementById('rating-value');
  console.log("It reaches here");
  stars.forEach((star) => {
    star.addEventListener('click', function () {
      const rating = this.getAttribute('data-value');
      console.log(rating);
      ratingValue.textContent = rating;
      
      stars.forEach(s => s.classList.remove('selected'));

      this.classList.add('selected');
      let previousStar = this.previousElementSibling;
      while (previousStar) {
        previousStar.classList.add('selected');
        previousStar = previousStar.previousElementSibling;
      }
    });
  });
});