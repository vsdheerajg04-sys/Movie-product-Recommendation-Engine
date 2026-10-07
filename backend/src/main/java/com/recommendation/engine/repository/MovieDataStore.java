package com.recommendation.engine.repository;

import com.recommendation.engine.model.Movie;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class MovieDataStore {

    private final Map<String, Movie> movieMap = new ConcurrentHashMap<>();

    public MovieDataStore() {
        initMovies();
    }

    public List<Movie> getAllMovies() {
        return new ArrayList<>(movieMap.values());
    }

    public Optional<Movie> getMovieById(String id) {
        return Optional.ofNullable(movieMap.get(id));
    }

    public List<Movie> getTrendingMovies(int limit) {
        return movieMap.values().stream()
                .sorted((a, b) -> Double.compare(b.getTrendingScore(), a.getTrendingScore()))
                .limit(limit)
                .collect(Collectors.toList());
    }

    public Set<String> getAllGenres() {
        Set<String> genres = new TreeSet<>();
        for (Movie m : movieMap.values()) {
            genres.addAll(m.getGenres());
        }
        return genres;
    }

    private void initMovies() {
        addMovie("m-1", "Inception", 2010, List.of("Sci-Fi", "Action", "Thriller"), "Christopher Nolan",
                List.of("Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"),
                4.8, 2450000, "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80",
                "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                148, 98.5, List.of("dreams", "mind-bending", "heist", "subconscious", "action", "nolan"));

        addMovie("m-2", "Interstellar", 2014, List.of("Sci-Fi", "Adventure", "Drama"), "Christopher Nolan",
                List.of("Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"),
                4.9, 1980000, "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
                "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
                169, 99.2, List.of("space", "wormhole", "black hole", "relativity", "emotional", "epic"));

        addMovie("m-3", "The Dark Knight", 2008, List.of("Action", "Crime", "Drama"), "Christopher Nolan",
                List.of("Christian Bale", "Heath Ledger", "Aaron Eckhart", "Gary Oldman"),
                4.9, 2800000, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
                "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
                152, 97.8, List.of("batman", "joker", "gotham", "superhero", "vigilante", "dark"));

        addMovie("m-4", "Pulp Fiction", 1994, List.of("Crime", "Drama"), "Quentin Tarantino",
                List.of("John Travolta", "Uma Thurman", "Samuel L. Jackson", "Bruce Willis"),
                4.7, 2150000, "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1200&auto=format&fit=crop&q=80",
                "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
                154, 91.0, List.of("cult classic", "dialogue", "nonlinear", "gangster", "tarantino"));

        addMovie("m-5", "The Matrix", 1999, List.of("Sci-Fi", "Action"), "Lana Wachowski, Lilly Wachowski",
                List.of("Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"),
                4.8, 2020000, "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
                "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
                136, 95.4, List.of("cyberpunk", "simulation", "martial arts", "ai", "hacker", "rebellion"));

        addMovie("m-6", "Avengers: Endgame", 2019, List.of("Action", "Adventure", "Sci-Fi"), "Anthony Russo, Joe Russo",
                List.of("Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"),
                4.7, 1250000, "https://images.unsplash.com/photo-1563089145-599997674d42?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&auto=format&fit=crop&q=80",
                "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions.",
                181, 96.0, List.of("marvel", "avengers", "superheroes", "thanos", "time travel", "epic finale"));

        addMovie("m-7", "Oppenheimer", 2023, List.of("Biography", "Drama", "History"), "Christopher Nolan",
                List.of("Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."),
                4.8, 850000, "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200&auto=format&fit=crop&q=80",
                "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
                180, 97.0, List.of("atomic bomb", "physics", "manhattan project", "politics", "cillian murphy"));

        addMovie("m-8", "Spider-Man: Across the Spider-Verse", 2023, List.of("Animation", "Action", "Adventure", "Sci-Fi"), "Joaquim Dos Santos, Kemp Powers",
                List.of("Shameik Moore", "Hailee Steinfeld", "Oscar Isaac", "Daniel Kaluuya"),
                4.8, 450000, "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=1200&auto=format&fit=crop&q=80",
                "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
                140, 94.8, List.of("multiverse", "spider-man", "animation", "visual masterpiece", "soundtrack"));

        addMovie("m-9", "Dune: Part Two", 2024, List.of("Sci-Fi", "Adventure", "Action"), "Denis Villeneuve",
                List.of("Timothee Chalamet", "Zendaya", "Rebecca Ferguson", "Javier Bardem", "Austin Butler"),
                4.9, 650000, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
                "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
                166, 99.0, List.of("sandworms", "arrakis", "spice", "prophecy", "denis villeneuve", "epic"));

        addMovie("m-10", "Blade Runner 2049", 2017, List.of("Sci-Fi", "Mystery", "Drama"), "Denis Villeneuve",
                List.of("Ryan Gosling", "Harrison Ford", "Ana de Armas", "Sylvia Hoeks"),
                4.6, 680000, "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
                "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
                164, 88.5, List.of("cyberpunk", "replicant", "neon", "philosophical", "cinematography"));

        addMovie("m-11", "Parasite", 2019, List.of("Drama", "Thriller", "Comedy"), "Bong Joon Ho",
                List.of("Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"),
                4.8, 920000, "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80",
                "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
                132, 93.5, List.of("class struggle", "korean", "oscar winner", "dark comedy", "suspense"));

        addMovie("m-12", "Whiplash", 2014, List.of("Drama", "Music"), "Damien Chazelle",
                List.of("Miles Teller", "J.K. Simmons", "Paul Reiser", "Melissa Benoist"),
                4.7, 980000, "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
                "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
                106, 91.2, List.of("drums", "jazz", "intensity", "obsession", "mastery", "perfection"));

        addMovie("m-13", "Gladiator", 2000, List.of("Action", "Adventure", "Drama"), "Ridley Scott",
                List.of("Russell Crowe", "Joaquin Phoenix", "Connie Nielsen", "Oliver Reed"),
                4.7, 1620000, "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=1200&auto=format&fit=crop&q=80",
                "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
                155, 89.0, List.of("rome", "colosseum", "vengeance", "epic", "historical", "gladiator"));

        addMovie("m-14", "Fight Club", 1999, List.of("Drama"), "David Fincher",
                List.of("Brad Pitt", "Edward Norton", "Helena Bonham Carter", "Meat Loaf"),
                4.8, 2300000, "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80",
                "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.",
                139, 94.0, List.of("anarchy", "psychological", "twist", "anti-consumerism", "fincher"));

        addMovie("m-15", "Spirited Away", 2001, List.of("Animation", "Adventure", "Family", "Fantasy"), "Hayao Miyazaki",
                List.of("Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"),
                4.8, 860000, "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
                "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
                125, 92.4, List.of("ghibli", "miyazaki", "spirits", "fantasy", "japanese animation", "classic"));

        addMovie("m-16", "The Grand Budapest Hotel", 2014, List.of("Comedy", "Drama", "Adventure"), "Wes Anderson",
                List.of("Ralph Fiennes", "Tony Revolori", "Saoirse Ronan", "Willem Dafoe"),
                4.6, 920000, "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
                "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge.",
                99, 87.5, List.of("symmetry", "aesthetic", "quirky", "wes anderson", "whimsical", "europe"));

        addMovie("m-17", "John Wick: Chapter 4", 2023, List.of("Action", "Crime", "Thriller"), "Chad Stahelski",
                List.of("Keanu Reeves", "Donnie Yen", "Bill Skarsgard", "Laurence Fishburne"),
                4.7, 420000, "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80",
                "John Wick uncovers a path to defeating The High Table. But before he can earn his freedom, Wick must face off against a new enemy with powerful alliances across the globe.",
                169, 93.0, List.of("gun fu", "assassin", "martial arts", "high table", "neo-noir", "action"));

        addMovie("m-18", "Everything Everywhere All at Once", 2022, List.of("Action", "Adventure", "Comedy", "Sci-Fi"), "Daniel Kwan, Daniel Scheinert",
                List.of("Michelle Yeoh", "Stephanie Hsu", "Ke Huy Quan", "Jamie Lee Curtis"),
                4.8, 620000, "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
                "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
                139, 96.5, List.of("multiverse", "absurdist", "family", "oscar best picture", "existentialism"));
        addMovie("m-19", "Arrival", 2016, List.of("Sci-Fi", "Drama", "Mystery"), "Denis Villeneuve",
                List.of("Amy Adams", "Jeremy Renner", "Forest Whitaker", "Michael Stuhlbarg"),
                4.7, 720000, "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
                "A linguist works with the military to communicate with alien lifeforms after twelve mysterious spacecraft appear around the world.",
                116, 92.0, List.of("linguistics", "aliens", "time", "thought-provoking", "denis villeneuve", "sci-fi"));

        addMovie("m-20", "Mad Max: Fury Road", 2015, List.of("Action", "Adventure", "Sci-Fi"), "George Miller",
                List.of("Tom Hardy", "Charlize Theron", "Nicholas Hoult", "Hugh Keays-Byrne"),
                4.8, 1100000, "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
                "In a post-apocalyptic wasteland, a woman rebels against a tyrannical ruler in search for her homeland with the aid of a group of female prisoners, a psychotic worshiper and an ex-drifter named Max.",
                120, 95.0, List.of("post-apocalyptic", "car chase", "fury road", "practical effects", "high octane"));

        addMovie("m-21", "The Prestige", 2006, List.of("Drama", "Mystery", "Sci-Fi"), "Christopher Nolan",
                List.of("Hugh Jackman", "Christian Bale", "Michael Caine", "Scarlett Johansson"),
                4.8, 1400000, "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80",
                "After a tragic accident, two stage magicians in 1890s London engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.",
                130, 93.8, List.of("illusion", "magic", "rivalry", "nolan", "twist", "tesla"));

        addMovie("m-22", "La La Land", 2016, List.of("Comedy", "Drama", "Music", "Romance"), "Damien Chazelle",
                List.of("Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt"),
                4.6, 640000, "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80",
                "While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.",
                128, 89.2, List.of("musical", "jazz", "hollywood", "romance", "cinematography", "dreams"));

        addMovie("m-23", "The Lord of the Rings: The Return of the King", 2003, List.of("Action", "Adventure", "Drama", "Fantasy"), "Peter Jackson",
                List.of("Elijah Wood", "Viggo Mortensen", "Ian McKellen", "Orlando Bloom"),
                4.9, 2100000, "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?w=1200&auto=format&fit=crop&q=80",
                "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.",
                201, 99.4, List.of("lotr", "middle earth", "epic fantasy", "oscar sweep", "masterpiece"));

        addMovie("m-24", "Coco", 2017, List.of("Animation", "Adventure", "Family", "Fantasy", "Music"), "Lee Unkrich, Adrian Molina",
                List.of("Anthony Gonzalez", "Gael Garcia Bernal", "Benjamin Bratt"),
                4.8, 580000, "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80",
                "Aspiring musician Miguel, confronted with his family's ancestral ban on music, enters the Land of the Dead to find his great-great-grandfather, a legendary singer.",
                105, 91.8, List.of("pixar", "day of the dead", "mexico", "family", "music", "emotional"));
    }

    public synchronized Movie addCustomMovie(Movie movie) {
        if (movie.getId() == null || movie.getId().trim().isEmpty()) {
            movie.setId("m-" + (movieMap.size() + 1) + "-" + UUID.randomUUID().toString().substring(0, 4));
        }
        if (movie.getPosterUrl() == null || movie.getPosterUrl().trim().isEmpty()) {
            movie.setPosterUrl("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80");
        }
        if (movie.getBackdropUrl() == null || movie.getBackdropUrl().trim().isEmpty()) {
            movie.setBackdropUrl(movie.getPosterUrl());
        }
        if (movie.getTrendingScore() == 0.0) {
            movie.setTrendingScore(85.0 + Math.random() * 10);
        }
        movieMap.put(movie.getId(), movie);
        return movie;
    }

    private void addMovie(String id, String title, int year, List<String> genres, String director,
                          List<String> cast, double rating, int voteCount, String posterUrl,
                          String backdropUrl, String overview, int durationMinutes, double trendingScore,
                          List<String> tags) {
        Movie m = new Movie(id, title, year, genres, director, cast, rating, voteCount, posterUrl, backdropUrl, overview, durationMinutes, trendingScore, tags);
        movieMap.put(id, m);
    }
}
