#include <bits/stdc++.h>
using namespace std;

int main() {
  int n;
  if (!(cin >> n))
    return 0;
  map<string, int> database;
  for (int i = 0; i < n; i++) {
    string s;
    cin >> s;
    if (database.count(s) == 0) {
      cout << "OK" << endl;
      database[s] = 1;
    } else {
      // Find the first suffix that is not yet registered
      while (database.count(s + to_string(database[s])))
        database[s]++;
      string new_name = s + to_string(database[s]);
      cout << new_name << endl;
      // Register both the new name and update the base name's counter
      database[new_name] = 1;
      database[s]++;
    }
  }
  return 0;
}
