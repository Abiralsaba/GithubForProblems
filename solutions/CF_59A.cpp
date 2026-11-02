#include <bits/stdc++.h>
using namespace std;

int main() {
    string s;
    cin >> s;
    char c = tolower(s.back());
    if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u' || c == 'y')
        cout << "YES" << endl;
    else
        cout << "NO" << endl;
    return 0;
}
