#include <bits/stdc++.h>
using namespace std;

int main() {
  int r = -1, c = -1;
  for (int i = 0; i < 5; i++)
    for (int j = 0; j < 5; j++) {
      int x; cin >> x;
      if (x == 1) { r = i; c = j; }
    }
  int moves = abs(r - 2) + abs(c - 2);
  cout << moves << endl;
  return 0;
}
