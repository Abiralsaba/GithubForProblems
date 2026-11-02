#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    int cnt = 0;
    for (char c : s) if (c == '4' || c == '7') cnt++;
    string t = to_string(cnt);
    bool lucky = true;
    for (char c : t) if (c != '4' && c != '7') lucky = false;
    if (lucky) cout << "YES" << endl;
    else cout << "NO" << endl;
    return 0;
}
