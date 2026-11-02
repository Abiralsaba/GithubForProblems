#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        long long a, b, n, m;
        cin >> a >> b >> n >> m;
        if (a + b >= n + m && min(a, b) >= m)
            cout << "Yes" << endl;
        else
            cout << "No" << endl;
    }
    return 0;
}
