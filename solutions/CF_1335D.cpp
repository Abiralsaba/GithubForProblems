#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        string s[9];
        for (int i = 0; i < 9; i++) cin >> s[i];
        int rows[9] = {0, 1, 2, 3, 4, 5, 6, 7, 8};
        int cols[9] = {0, 3, 6, 1, 4, 7, 2, 5, 8};
        for (int i = 0; i < 9; i++) s[rows[i]][cols[i]] = (s[rows[i]][cols[i]] == '1' ? '2' : '1');
        for (int i = 0; i < 9; i++) cout << s[i] << endl;
    }
    return 0;
}
