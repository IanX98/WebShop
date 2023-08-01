import { HttpClient  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, takeWhile } from 'rxjs';
import TMDBMovie from './models/TmdbMovie';

@Injectable({
  providedIn: 'root'
})
export class TmdbApiService {

  constructor(private http: HttpClient) {
    this.currentPage$.pipe(takeWhile(() => this.validatePageNumber())).subscribe(page => {
      this.currentPage$.next(page);
    });

    this.showMovies$.pipe(takeWhile(() => this.validateMoviesObj())).subscribe(movies => {
      this.showMovies$.next(movies);
    });
   }
    
  API_URL = 'https://api.themoviedb.org/3';
  API_IMG = 'https://image.tmdb.org/t/p/w500/';
  API_MOVIE = 'https://api.themoviedb.org/3/movie/';
  API_KEY = 'a11a3a1b7510b6fa1508f15d307460b6';
  API_SEARCH = 'https://api.themoviedb.org/3/search/movie/';

    movie!: TMDBMovie | any;
    query!: string;

    showMovies$: BehaviorSubject<TMDBMovie[]> = new BehaviorSubject<TMDBMovie[]>(this.getMovieObj());
    currentPage$ = new BehaviorSubject(1);

    topRatedURL = `${this.API_MOVIE}top_rated?api_key=${this.API_KEY}`;

    getAllMovies(page: number): Observable<TMDBMovie | any> {
      const url = `${this.API_URL}/movie/popular`;
      const params = { 
        api_key: this.API_KEY,
        page: page.toString(),
      };

      return this.http.get<string>(url, { params });
    }

    getTopRatedMovies(): Observable<TMDBMovie | any> {
      return this.http.get<string>(this.topRatedURL);
    }

    searchMovies = (query: string): Observable<Object> => {
      const url = `${this.API_URL}/search/movie?api_key=${this.API_KEY}&query=${query}`;
      return this.http.get(url);
    }

    fetchMovies(page: number): TMDBMovie[] {
      let movieObj!: TMDBMovie[];
      this.getAllMovies(page).subscribe(response => {
        this.showMovies$.next(response.results);
        movieObj = this.showMovies$.value;
      });

      return movieObj;
    }

    setSelectedMovie = (movie: TMDBMovie): void => {
      this.movie = movie
    }

    getSelectedMovie = (): TMDBMovie | any => {
      return this.movie;
    }

    setQueryText(query: string): void {
      this.query = query;
    }

    getQueryText(): string {
      return this.query
    }

    nextPage(): void {
      this.currentPage$.next(this.currentPage$.getValue() + 1)
    }

    previousPage(): void {
      this.currentPage$.next(this.currentPage$.getValue() - 1);
    }

    validatePageNumber(): boolean {
      if (this.currentPage$.value > 1) {
        return true;
      }

      return false
    }

    requestTmdbMovieObj(): Observable<TMDBMovie> {
      return this.http.get<TMDBMovie>('assets/TmdbMovieObj.json');
    }

    getMovieObj() {
      let movieObj!: TMDBMovie[];
      this.requestTmdbMovieObj().subscribe(
        (tmdbMovie) => {
          movieObj = [tmdbMovie];
        },
        (error) => {
          console.error('Erro ao obter os dados:', error);
        }
      );

      return movieObj;
    }

    validateMoviesObj(): boolean {
      if (this.showMovies$?.value != null) {
        return true;
      }

      return false
    }
}