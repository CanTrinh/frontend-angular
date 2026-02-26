import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphQLService {
  private graphqlUrl = 'http://localhost:3000/graphql';

  constructor(private http: HttpClient) {}

  queryGraphQL(query: string, variables?: any) {
    return this.http.post(this.graphqlUrl, {
      query,
      variables
    });
  }
}
